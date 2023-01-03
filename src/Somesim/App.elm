module Somesim.App exposing (main)

import Browser
import Browser.Navigation as Navigation
import Helpers.ImageConcat exposing (Msg(..))
import Html exposing (..)
import Html.Attributes exposing (attribute, class, draggable, property, selected)
import Html.Events exposing (on, onClick, preventDefaultOn)
import Http
import Json.Decode as Decode
import Json.Encode as Encode
import Path
import QueryStrings exposing (QueryStrings)
import Somesim.Flower as Flower
import Somesim.Hsl as Hsl
import Somesim.Index as Index
import Url



-- MAIN


main : Program Decode.Value Model Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        , onUrlChange = UrlChanged
        , onUrlRequest = LinkClicked
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


type DraggableItem
    = Flower Flower.Flower


type ColorTab
    = FlowerTab
    | CustomTab


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
    , key : Navigation.Key

    -- 現在のURL
    , url : Url.Url
    , dragging : Maybe DraggableItem
    , hsl : Hsl.Hsl
    , colorTab : ColorTab
    }


type Model
    = Booted BootedModel
    | BadConfiguration BadConfigurationModel


chainUpdate : Msg -> ( Model, Cmd Msg ) -> ( Model, Cmd Msg )
chainUpdate msg ( model, a ) =
    update msg model
        |> Tuple.mapSecond (\b -> Cmd.batch [ a, b ])


init : Decode.Value -> Url.Url -> Navigation.Key -> ( Model, Cmd Msg )
init flags url key =
    case Decode.decodeValue decodeFlags flags of
        Ok { baseUrl } ->
            let
                query =
                    url.query
                        |> Maybe.map QueryStrings.fromString

                colorTab =
                    query
                        |> Maybe.andThen (QueryStrings.get "color")
                        |> Maybe.map Encode.string
                        |> Maybe.map (Decode.decodeValue colorTabDecoder)
                        |> Maybe.andThen Result.toMaybe
                        |> Maybe.withDefault FlowerTab

                hsl : Hsl.Hsl
                hsl =
                    { h =
                        query
                            |> Maybe.andThen (QueryStrings.get "h")
                            |> Maybe.andThen String.toInt
                            |> Maybe.withDefault 0
                            |> clamp 0 360
                    , s =
                        query
                            |> Maybe.andThen (QueryStrings.get "s")
                            |> Maybe.andThen String.toFloat
                            |> Maybe.map (\s -> s / 100)
                            |> Maybe.withDefault 1.0
                            |> clamp 0.0 1.0
                    , l =
                        query
                            |> Maybe.andThen (QueryStrings.get "l")
                            |> Maybe.andThen String.toFloat
                            |> Maybe.map (\l -> l / 100)
                            |> Maybe.withDefault 0.5
                            |> clamp 0.0 1.0
                    }
            in
            Booted
                { index = Idle
                , baseUrl = baseUrl
                , selectedItem = Nothing
                , flowers = Idle
                , flowerSlots = FlowerSlots Nothing Nothing Nothing Nothing
                , focus = Slot1
                , stain = Nothing
                , url = url
                , key = key
                , dragging = Nothing
                , hsl = hsl
                , colorTab = colorTab
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
    | RemoveFlowerFromSlot FlowerSlotFocus
    | PersistSelectionToUrl
    | LinkClicked Browser.UrlRequest
    | UrlChanged Url.Url
    | DragStart DraggableItem
    | DragEnd
    | DropFlower FlowerSlotFocus
    | UpdateHsl Hsl.Hsl
    | ChangeColorTab ColorTab
    | NoOp


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


chain : Msg -> ( Model, Cmd Msg ) -> ( Model, Cmd Msg )
chain msg ( ma, ca ) =
    let
        ( mb, cb ) =
            update msg ma
    in
    ( mb, Cmd.batch [ ca, cb ] )


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
                    let
                        defaultSelected =
                            okModel.url.query
                                |> Maybe.map QueryStrings.fromString
                                |> Maybe.andThen (QueryStrings.get "i")
                                |> Maybe.map Index.stringToId
                                |> Maybe.andThen (\id -> Index.find id index)
                    in
                    ( Booted { okModel | index = Fetched index, selectedItem = defaultSelected }
                    , Cmd.none
                    )

                GotIndex (Err err) ->
                    ( Booted { okModel | index = FailedToFetch err }, Cmd.none )

                SelectIndex selected ->
                    ( Booted { okModel | selectedItem = Just selected }, Cmd.none )
                        |> chain PersistSelectionToUrl

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
                    let
                        qs =
                            okModel.url.query
                                |> Maybe.map QueryStrings.fromString

                        fromQuery : String -> Maybe Flower.Flower
                        fromQuery key =
                            qs
                                |> Maybe.andThen (QueryStrings.get key)
                                |> Maybe.map Flower.stringToId
                                |> Maybe.andThen (\id -> Flower.find id defs)

                        slots : FlowerSlots
                        slots =
                            { slot1 = fromQuery "s1"
                            , slot2 = fromQuery "s2"
                            , slot3 = fromQuery "s3"
                            , slot4 = fromQuery "s4"
                            }
                    in
                    ( Booted
                        { okModel
                            | flowers = Fetched defs
                            , flowerSlots = slots
                            , stain = blendFlowerSlots slots
                        }
                    , Cmd.none
                    )

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
                        |> chain PersistSelectionToUrl

                RemoveFlowerFromSlot slot ->
                    let
                        { flowerSlots } =
                            okModel

                        newSlots =
                            case slot of
                                Slot1 ->
                                    { flowerSlots | slot1 = Nothing }

                                Slot2 ->
                                    { flowerSlots | slot2 = Nothing }

                                Slot3 ->
                                    { flowerSlots | slot3 = Nothing }

                                Slot4 ->
                                    { flowerSlots | slot4 = Nothing }
                    in
                    ( Booted { okModel | flowerSlots = newSlots, stain = blendFlowerSlots newSlots }, Cmd.none )
                        |> chain PersistSelectionToUrl

                PersistSelectionToUrl ->
                    let
                        itemQuery =
                            case okModel.selectedItem of
                                Just (Index.Item { id } _) ->
                                    Just ( "i", Just (Index.idToString id) )

                                _ ->
                                    Nothing

                        colorQuery =
                            case okModel.colorTab of
                                FlowerTab ->
                                    [ Just ( "color", Just "flower" )
                                    , okModel.flowerSlots.slot1 |> Maybe.map (\flower -> ( "s1", Just (Flower.idToString flower.id) ))
                                    , okModel.flowerSlots.slot2 |> Maybe.map (\flower -> ( "s2", Just (Flower.idToString flower.id) ))
                                    , okModel.flowerSlots.slot3 |> Maybe.map (\flower -> ( "s3", Just (Flower.idToString flower.id) ))
                                    , okModel.flowerSlots.slot4 |> Maybe.map (\flower -> ( "s4", Just (Flower.idToString flower.id) ))
                                    ]

                                CustomTab ->
                                    [ Just ( "color", Just "custom" )
                                    , Just ( "h", Just (okModel.hsl.h |> String.fromInt) )
                                    , Just ( "s", Just (okModel.hsl.s * 100 |> floor |> String.fromInt) )
                                    , Just ( "l", Just (okModel.hsl.l * 100 |> floor |> String.fromInt) )
                                    ]

                        query =
                            itemQuery
                                :: colorQuery
                                |> List.filterMap identity
                                |> List.reverse
                                |> List.foldl (\( key, value ) -> QueryStrings.prepend key value) QueryStrings.empty
                                |> QueryStrings.toString

                        currentUrl =
                            okModel.url

                        nextUrl =
                            { currentUrl
                                | query = Just query
                            }
                    in
                    ( Booted { okModel | url = nextUrl }, Navigation.replaceUrl okModel.key (Url.toString nextUrl) )

                LinkClicked req ->
                    case req of
                        Browser.External href ->
                            ( Booted okModel, Navigation.load href )

                        Browser.Internal url ->
                            ( Booted okModel, Navigation.load (Url.toString url) )

                UrlChanged url ->
                    ( Booted { okModel | url = url }, Cmd.none )

                DragStart item ->
                    ( Booted { okModel | dragging = Just item }, Cmd.none )

                DragEnd ->
                    ( Booted { okModel | dragging = Nothing }, Cmd.none )

                DropFlower slot ->
                    case okModel.dragging of
                        Just (Flower flower) ->
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
                            ( Booted
                                { okModel
                                    | flowerSlots = newSlots
                                    , stain = blendFlowerSlots newSlots
                                    , dragging = Nothing
                                }
                            , Cmd.none
                            )
                                |> chain PersistSelectionToUrl

                        _ ->
                            ( Booted { okModel | dragging = Nothing }, Cmd.none )

                UpdateHsl hsl ->
                    ( Booted { okModel | hsl = hsl }, Cmd.none )

                ChangeColorTab tab ->
                    ( Booted { okModel | colorTab = tab }, Cmd.none )
                        |> chain PersistSelectionToUrl

                NoOp ->
                    ( model, Cmd.none )



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


preview : BootedModel -> Html Msg
preview model =
    node "app-preview"
        []
        ((case model.selectedItem of
            Just selectedItem ->
                case selectedItem of
                    Index.Item _ image ->
                        Just
                            [ div []
                                [ node
                                    "somesim-renderer"
                                    [ attribute "src" (Url.toString image)
                                    , case ( model.colorTab, model.stain ) of
                                        ( CustomTab, _ ) ->
                                            attribute
                                                "color"
                                                (Hsl.toHex model.hsl)

                                        ( FlowerTab, Just color ) ->
                                            attribute "color" (Flower.flowerColorToHex color)

                                        _ ->
                                            class ""
                                    ]
                                    []
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
            node "app-tree-group"
                [ if meta.defaultExpanded then
                    attribute "expanded" ""

                  else
                    class ""
                ]
                (span [ attribute "slot" "label" ] [ text meta.name ]
                    :: List.map (indexTree selected) children
                )

        Index.Item meta _ ->
            node "app-tree-item"
                [ property "selected"
                    (case selected of
                        Just s ->
                            Encode.bool (s == index)

                        Nothing ->
                            Encode.bool False
                    )
                , on "select" (Decode.succeed (SelectIndex index))
                ]
                [ text meta.name ]


indexPane : BootedModel -> Html Msg
indexPane model =
    case model.index of
        Fetched index ->
            node "app-tree"
                [ attribute "label" "染色装備" ]
                [ indexTree model.selectedItem index ]

        FailedToFetch err ->
            httpErrorToHtml err

        _ ->
            span [] [ text "読込中..." ]


flowerSlotUi : BootedModel -> Maybe Flower.Flower -> FlowerSlotFocus -> Html Msg
flowerSlotUi model slot focus =
    let
        htmlSlot =
            case focus of
                Slot1 ->
                    "slot1"

                Slot2 ->
                    "slot2"

                Slot3 ->
                    "slot3"

                Slot4 ->
                    "slot4"
    in
    node "app-color-swatch"
        ([ attribute "slot" htmlSlot
         , attribute "interactive" ""
         , case model.dragging of
            Just _ ->
                class "dnd-above-overlay"

            Nothing ->
                class ""
         , preventDefaultOn "dragover" (Decode.succeed ( NoOp, True ))
         , Html.Events.custom "drop" (Decode.succeed { message = DropFlower focus, preventDefault = True, stopPropagation = True })
         , onClick
            (if focus == model.focus then
                RemoveFlowerFromSlot focus

             else
                FocusFlowerSlot focus
            )
         ]
            ++ (case slot of
                    Just flower ->
                        [ attribute "title" flower.name
                        , attribute "value" ("#" ++ Flower.flowerColorToHex flower.color)
                        ]

                    Nothing ->
                        [ attribute "title" "花びら未設定" ]
               )
        )
        []


selectableFlower : Msg -> Flower.Flower -> Html Msg
selectableFlower onSelect flower =
    node
        "app-color-swatch"
        [ attribute "interactive" ""
        , attribute "title" flower.name
        , attribute "value" ("#" ++ Flower.flowerColorToHex flower.color)
        , draggable "true"
        , on "dragstart" (Decode.succeed (DragStart (Flower flower)))
        , onClick onSelect
        ]
        []


flowersPane : BootedModel -> Html Msg
flowersPane model =
    div [ class "flower-pane" ]
        [ div [ class "stain" ]
            [ node "app-stain"
                [ attribute "selected"
                    (case model.focus of
                        Slot1 ->
                            "slot1"

                        Slot2 ->
                            "slot2"

                        Slot3 ->
                            "slot3"

                        Slot4 ->
                            "slot4"
                    )
                ]
                [ node "app-color-swatch"
                    [ attribute "slot" "blended"
                    , case model.stain of
                        Just color ->
                            attribute "value" ("#" ++ Flower.flowerColorToHex color)

                        Nothing ->
                            class ""
                    ]
                    []
                , flowerSlotUi model model.flowerSlots.slot1 Slot1
                , flowerSlotUi model model.flowerSlots.slot2 Slot2
                , flowerSlotUi model model.flowerSlots.slot3 Slot3
                , flowerSlotUi model model.flowerSlots.slot4 Slot4
                ]
            ]
        , case model.flowers of
            Fetched defs ->
                div [ class "flowers", attribute "role" "list" ]
                    (List.map
                        (\def ->
                            div [ attribute "role" "listitem" ]
                                [ node "app-flower-group"
                                    []
                                    (span [ attribute "slot" "title" ] [ text def.name ]
                                        :: List.map
                                            (\flower ->
                                                div
                                                    [ attribute "role" "listitem" ]
                                                    [ selectableFlower (SetFlowerToSlot flower model.focus) flower ]
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


colorPickerEventDecoder : Decode.Decoder Hsl.Hsl
colorPickerEventDecoder =
    Decode.field "detail"
        (Decode.map3
            Hsl.Hsl
            (Decode.field "hue" Decode.int)
            (Decode.field "saturation" Decode.float)
            (Decode.field "lightness" Decode.float)
        )


customColorPane : BootedModel -> Html Msg
customColorPane model =
    div [ class "color-picker-container" ]
        [ node "app-color-picker"
            [ attribute "hue" (String.fromInt model.hsl.h)
            , attribute "saturation" (String.fromFloat model.hsl.s)
            , attribute "lightness" (String.fromFloat model.hsl.l)
            , on "app-color-input" (Decode.map UpdateHsl colorPickerEventDecoder)
            , on "app-color-change" (Decode.succeed PersistSelectionToUrl)
            ]
            []
        ]


colorTabToString : ColorTab -> String
colorTabToString t =
    case t of
        FlowerTab ->
            "flower"

        CustomTab ->
            "custom"


colorTabDecoder : Decode.Decoder ColorTab
colorTabDecoder =
    Decode.string
        |> Decode.andThen
            (\str ->
                case str of
                    "flower" ->
                        Decode.succeed FlowerTab

                    "custom" ->
                        Decode.succeed CustomTab

                    _ ->
                        Decode.fail "サポートされていないタブ種別です"
            )


tabChangeEventDecoder : Decode.Decoder Msg
tabChangeEventDecoder =
    Decode.at [ "detail", "value" ] colorTabDecoder
        |> Decode.map ChangeColorTab


colorPanel : BootedModel -> Html Msg
colorPanel model =
    node "app-tabs"
        [ attribute "value" (colorTabToString model.colorTab), on "app-tab-change" tabChangeEventDecoder ]
        [ node "app-tab" [ attribute "slot" "tab", attribute "value" (colorTabToString FlowerTab) ] [ text "花びら" ]
        , node "app-tab" [ attribute "slot" "tab", attribute "value" (colorTabToString CustomTab) ] [ text "カスタム" ]
        , node "app-tab-panel" [ attribute "value" (colorTabToString FlowerTab) ] [ flowersPane model ]
        , node "app-tab-panel" [ attribute "value" (colorTabToString CustomTab) ] [ customColorPane model ]
        ]


bootedView : BootedModel -> Html Msg
bootedView model =
    node "app-layout"
        [ on "dragend" (Decode.succeed DragEnd) ]
        [ div [ attribute "slot" "item" ] [ indexPane model ]
        , preview model
        , div [ class "color-panel", attribute "slot" "color" ] [ colorPanel model ]
        , div
            [ class "dnd-overlay"
            , case model.dragging of
                Just _ ->
                    attribute "data-active" ""

                Nothing ->
                    class ""
            , on "drop" (Decode.succeed DragEnd)
            ]
            []
        ]


title : Model -> String
title model =
    case model of
        BadConfiguration _ ->
            "起動エラー | そめしむ"

        Booted { selectedItem, index } ->
            case ( selectedItem, index ) of
                ( Just item, Fetched i ) ->
                    case Index.getAncestors item i of
                        -- ルートインデックス名を表示しても邪魔なだけなので省く
                        Just (_ :: path) ->
                            let
                                joined =
                                    path
                                        ++ [ item ]
                                        |> List.map Index.name
                                        |> String.join " > "
                            in
                            joined ++ " | そめしむ"

                        _ ->
                            Index.name item ++ " | そめしむ"

                _ ->
                    "そめしむ"


view : Model -> Browser.Document Msg
view model =
    { title = title model
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
