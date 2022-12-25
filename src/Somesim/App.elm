module Somesim.App exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes exposing (attribute, class, style)
import Html.Events exposing (onClick)
import Http
import Json.Decode as Decode
import Path
import Somesim.Flower as Flower
import Somesim.Index as Index
import Url



-- MAIN


main : Program Decode.Value Model Msg
main =
    Browser.document
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- FLAGS


type alias Flags =
    { baseUrl : Url.Url }


decodeFlags : Decode.Decoder Flags
decodeFlags =
    Decode.map
        Flags
        (Decode.field "baseUrl" Decode.string
            |> Decode.andThen
                (\str ->
                    case Url.fromString str of
                        Just url ->
                            Decode.succeed url

                        Nothing ->
                            Decode.fail (str ++ "は有効なURLではありません")
                )
        )



-- MODEL


type RemoteResource err value
    = Fetched value
    | Fetching
    | FailedToFetch err
    | Idle


type alias BadConfigurationModel =
    {}


type alias FlowerSlots =
    { slot1 : Maybe Flower.Flower
    , slot2 : Maybe Flower.Flower
    , slot3 : Maybe Flower.Flower
    , slot4 : Maybe Flower.Flower
    }


type FlowerSlotFocus
    = Slot1
    | Slot2
    | Slot3
    | Slot4


type alias BootedModel =
    { index : RemoteResource Http.Error Index.Index
    , baseUrl : Url.Url
    , selectedItem : Maybe Index.Index
    , flowers : RemoteResource Http.Error Flower.Definition

    -- 染色液の合成に利用する花びらスロット
    , flowerSlots : FlowerSlots

    -- どの花びらスロットを選択中か
    , focus : FlowerSlotFocus

    -- 合成された染色液、これでプレビューの画像を染色する
    , stain : Maybe Flower.FlowerColor
    }


type Model
    = Booted BootedModel
    | BadConfiguration BadConfigurationModel


chainUpdate : Msg -> ( Model, Cmd Msg ) -> ( Model, Cmd Msg )
chainUpdate msg ( model, a ) =
    update msg model
        |> Tuple.mapSecond (\b -> Cmd.batch [ a, b ])


init : Decode.Value -> ( Model, Cmd Msg )
init flags =
    case Decode.decodeValue decodeFlags flags of
        Ok { baseUrl } ->
            Booted
                { index = Idle
                , baseUrl = baseUrl
                , selectedItem = Nothing
                , flowers = Idle
                , flowerSlots = FlowerSlots Nothing Nothing Nothing Nothing
                , focus = Slot1
                , stain = Nothing
                }
                |> update FetchIndex
                |> chainUpdate FetchFlowerDefinition

        Err _ ->
            ( BadConfiguration {}, Cmd.none )



-- UPDATE


type Msg
    = FetchIndex
    | GotIndex (Result Http.Error Index.Index)
    | SelectIndex Index.Index
    | FetchFlowerDefinition
    | GotFlowerDefinition (Result Http.Error Flower.Definition)
    | FocusFlowerSlot FlowerSlotFocus
    | SetFlowerToSlot Flower.Flower FlowerSlotFocus


blendFlowerSlots : FlowerSlots -> Maybe Flower.FlowerColor
blendFlowerSlots slots =
    [ slots.slot1
    , slots.slot2
    , slots.slot3
    , slots.slot4
    ]
        |> List.filterMap identity
        |> List.map .color
        |> Flower.blendFlowerColors


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case model of
        BadConfiguration _ ->
            ( model, Cmd.none )

        Booted okModel ->
            case msg of
                FetchIndex ->
                    let
                        baseUrl =
                            okModel.baseUrl

                        basePath =
                            Path.fromString baseUrl.path

                        imageBaseUrl =
                            { baseUrl
                                | path =
                                    Path.resolve basePath (Path.fromString "images/")
                                        |> Path.toString
                            }
                    in
                    ( Booted { okModel | index = Fetching }
                    , Http.get
                        { url =
                            Path.resolve basePath (Path.fromString "images/index.json")
                                |> Path.toString
                        , expect = Http.expectJson GotIndex (Index.decoder imageBaseUrl)
                        }
                    )

                GotIndex (Ok index) ->
                    ( Booted { okModel | index = Fetched index }, Cmd.none )

                GotIndex (Err err) ->
                    ( Booted { okModel | index = FailedToFetch err }, Cmd.none )

                SelectIndex selected ->
                    ( Booted { okModel | selectedItem = Just selected }, Cmd.none )

                FetchFlowerDefinition ->
                    ( Booted { okModel | flowers = Fetching }
                    , Http.get
                        { url =
                            Path.resolve
                                (Path.fromString okModel.baseUrl.path)
                                (Path.fromString "flowers.json")
                                |> Path.toString
                        , expect = Http.expectJson GotFlowerDefinition Flower.definitionDecoder
                        }
                    )

                GotFlowerDefinition (Ok defs) ->
                    ( Booted { okModel | flowers = Fetched defs }, Cmd.none )

                GotFlowerDefinition (Err err) ->
                    ( Booted { okModel | flowers = FailedToFetch err }, Cmd.none )

                FocusFlowerSlot focus ->
                    ( Booted { okModel | focus = focus }, Cmd.none )

                SetFlowerToSlot flower slot ->
                    let
                        { flowerSlots } =
                            okModel

                        newSlots =
                            case slot of
                                Slot1 ->
                                    { flowerSlots | slot1 = Just flower }

                                Slot2 ->
                                    { flowerSlots | slot2 = Just flower }

                                Slot3 ->
                                    { flowerSlots | slot3 = Just flower }

                                Slot4 ->
                                    { flowerSlots | slot4 = Just flower }
                    in
                    ( Booted { okModel | flowerSlots = newSlots, stain = blendFlowerSlots newSlots }, Cmd.none )



-- VIEW


httpErrorToHtml : Http.Error -> Html msg
httpErrorToHtml err =
    case err of
        Http.BadUrl url ->
            text (url ++ "は有効なURLではありません")

        Http.Timeout ->
            text "タイムアウトしました"

        Http.NetworkError ->
            text "ネットワークに接続できませんでした"

        Http.BadStatus status ->
            text ("サーバエラー(" ++ String.fromInt status ++ ")")

        Http.BadBody reason ->
            text ("レスポンス異常: " ++ reason)


indexToString : Index.Index -> String
indexToString index =
    case index of
        Index.Group { name } _ ->
            name

        Index.Item { name } _ ->
            name


itemPath : Index.Index -> Maybe Index.Index -> Html msg
itemPath item root =
    let
        current =
            span [] [ text (indexToString item) ]

        ancestors =
            case Maybe.map (Index.getAncestors item) root |> Maybe.withDefault Nothing of
                Just list ->
                    list
                        |> List.map indexToString
                        |> List.map text
                        |> List.map (\t -> li [] [ t ])

                Nothing ->
                    []
    in
    node "app-breadcrumbs" [] (ancestors ++ [ current ])


preview : BootedModel -> Html Msg
preview model =
    node "app-preview"
        [ attribute "slot" "preview" ]
        ((case model.selectedItem of
            Just selectedItem ->
                case selectedItem of
                    Index.Item _ image ->
                        Just
                            [ div []
                                [ node
                                    "somesim-renderer"
                                    [ attribute "src" (Url.toString image)
                                    , case model.stain of
                                        Just color ->
                                            attribute "color" (Flower.flowerColorToHex color)

                                        Nothing ->
                                            class ""
                                    ]
                                    []
                                ]
                            , div [ attribute "slot" "status" ]
                                [ itemPath selectedItem
                                    (case model.index of
                                        Fetched index ->
                                            Just index

                                        _ ->
                                            Nothing
                                    )
                                ]
                            ]

                    _ ->
                        Nothing

            _ ->
                Nothing
         )
            |> Maybe.withDefault [ span [] [ text "装備を選んでください" ] ]
        )


indexTree : Maybe Index.Index -> Index.Index -> Html Msg
indexTree selected index =
    case index of
        Index.Group meta children ->
            node "app-item-list-group"
                []
                [ span [ attribute "slot" "title" ] [ text meta.name ]
                , ul [] (List.map (indexTree selected) children)
                ]

        Index.Item meta _ ->
            node "app-item-list-item"
                [ attribute "aria-current"
                    (case selected of
                        Just s ->
                            if s == index then
                                "true"

                            else
                                "false"

                        Nothing ->
                            "false"
                    )
                , onClick (SelectIndex index)
                ]
                [ text meta.name ]


indexPane : BootedModel -> Html Msg
indexPane model =
    div [ attribute "slot" "index" ]
        (case model.index of
            Fetched index ->
                [ node "app-item-list" [] [ indexTree model.selectedItem index ] ]

            FailedToFetch err ->
                [ httpErrorToHtml err ]

            _ ->
                [ span [] [ text "読込中..." ] ]
        )


flowerSlotUi : Maybe Flower.Flower -> msg -> Html msg
flowerSlotUi slot msg =
    node "app-flower-color"
        (case slot of
            Just flower ->
                [ attribute "flower-name" flower.name
                , attribute "color" ("#" ++ Flower.flowerColorToHex flower.color)
                , onClick msg
                ]

            Nothing ->
                [ onClick msg ]
        )
        []


flowersPane : BootedModel -> Html Msg
flowersPane model =
    div [ attribute "slot" "controls" ]
        [ node "app-stain"
            []
            [ div
                [ attribute "slot" "blended"
                , style "background-color"
                    (case model.stain of
                        Just color ->
                            "#" ++ Flower.flowerColorToHex color

                        Nothing ->
                            "transparent"
                    )
                ]
                []
            , flowerSlotUi model.flowerSlots.slot1 (FocusFlowerSlot Slot1)
            , flowerSlotUi model.flowerSlots.slot2 (FocusFlowerSlot Slot2)
            , flowerSlotUi model.flowerSlots.slot3 (FocusFlowerSlot Slot3)
            , flowerSlotUi model.flowerSlots.slot4 (FocusFlowerSlot Slot4)
            ]
        , case model.flowers of
            Fetched defs ->
                div [ attribute "role" "list" ]
                    (List.map
                        (\def ->
                            div [ attribute "role" "listitem" ]
                                [ node "app-flower-group"
                                    []
                                    (span [ attribute "slot" "title" ] [ text def.name ]
                                        :: List.map
                                            (\flower ->
                                                node
                                                    "app-flower-color"
                                                    [ attribute "flower-name" flower.name
                                                    , attribute "color" ("#" ++ Flower.flowerColorToHex flower.color)
                                                    , onClick (SetFlowerToSlot flower model.focus)
                                                    ]
                                                    []
                                            )
                                            def.children
                                    )
                                ]
                        )
                        defs
                    )

            FailedToFetch err ->
                httpErrorToHtml err

            Idle ->
                text ""

            Fetching ->
                span [] [ text "読込中..." ]
        ]


bootedView : BootedModel -> Html Msg
bootedView model =
    node "app-layout"
        []
        [ indexPane model
        , preview model
        , flowersPane model
        ]


view : Model -> Browser.Document Msg
view model =
    { title = "そめしむ"
    , body =
        case model of
            BadConfiguration _ ->
                [ div [] [ text "起動フラグが不正です" ] ]

            Booted bootedModel ->
                [ bootedView bootedModel ]
    }



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none
