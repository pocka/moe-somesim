port module Helpers.ImageConcat exposing (..)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Json.Decode as Decode
import Json.Encode as Encode



-- MAIN


main : Program () Model Msg
main =
    Browser.document
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- PORTS


port sendFreeImage : Encode.Value -> Cmd msg


port sendImageCreationRequest : Encode.Value -> Cmd msg


port sendRenderingRequest : Encode.Value -> Cmd msg


port recieveCreatedImage : (Decode.Value -> msg) -> Sub msg



-- MODEL


type alias Image =
    { width : Int
    , height : Int
    , ref : Decode.Value
    }


type alias File =
    { name : String
    , mime : String
    , ref : Decode.Value
    }


type FileSelectError
    = UnsupportedMime String


type alias ConcatItem =
    { file : File
    , image : Image
    }


type alias Model =
    { items : List ConcatItem
    , fileSelectError : Maybe FileSelectError
    , dropZoneHovering : Bool
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { items = []
      , fileSelectError = Nothing
      , dropZoneHovering = False
      }
    , Cmd.none
    )



-- UPDATE


type Msg
    = DragEnter
    | DragLeave
    | GotFiles File (List File)
    | ClearItems
    | RemoveItem ConcatItem
    | GotItem ConcatItem
    | NoOp


renderFiles : Model -> ( Model, Cmd msg )
renderFiles model =
    ( model, sendRenderingRequest (Encode.list (\x -> x.image.ref) model.items) )


createImages : List File -> Model -> ( Model, Cmd msg )
createImages files model =
    ( model, Cmd.batch (files |> List.map (\file -> sendImageCreationRequest file.ref)) )


freeImages : List Image -> ( Model, Cmd msg ) -> ( Model, Cmd msg )
freeImages images ( model, cmd ) =
    ( model, Cmd.batch (cmd :: (images |> List.map (\image -> sendFreeImage image.ref))) )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        DragEnter ->
            ( { model | dropZoneHovering = True }, Cmd.none )

        DragLeave ->
            ( { model | dropZoneHovering = False }, Cmd.none )

        GotItem item ->
            { model | items = model.items ++ [ item ] }
                |> renderFiles

        GotFiles file files ->
            let
                ( pngFiles, nonPngFiles ) =
                    file
                        :: files
                        |> List.partition (\f -> f.mime == "image/png")
            in
            { model
                | fileSelectError = List.head nonPngFiles |> Maybe.map (\f -> UnsupportedMime f.mime)
                , dropZoneHovering = False
            }
                |> createImages pngFiles

        ClearItems ->
            { model | items = [] }
                |> renderFiles
                |> freeImages (model.items |> List.map .image)

        RemoveItem item ->
            let
                ( itemsToBeDeleted, newItems ) =
                    model.items
                        |> List.partition ((==) item)
            in
            { model | items = newItems }
                |> renderFiles
                |> freeImages (List.map .image itemsToBeDeleted)

        NoOp ->
            ( model, Cmd.none )



-- VIEW


fileDecoder : Decode.Decoder File
fileDecoder =
    Decode.map3
        File
        (Decode.field "name" Decode.string)
        (Decode.field "type" Decode.string)
        Decode.value


dropEventDecoder : Decode.Decoder Msg
dropEventDecoder =
    Decode.at [ "dataTransfer", "files" ] (Decode.oneOrMore GotFiles fileDecoder)


fileChangeEventDecoder : Decode.Decoder Msg
fileChangeEventDecoder =
    Decode.at [ "currentTarget", "files" ] (Decode.oneOrMore GotFiles fileDecoder)


view : Model -> Browser.Document Msg
view model =
    { title = "そめしむヘルパ - 画像結合ツール"
    , body =
        [ div [ class "actions" ]
            [ label [ class "button" ]
                [ input
                    [ type_ "file"
                    , accept "image/png"
                    , multiple True
                    , on "change" fileChangeEventDecoder
                    ]
                    []
                , text "ファイルを選択"
                ]
            , button
                [ class "button", disabled (List.length model.items == 0), onClick ClearItems ]
                [ text "ファイルをクリア" ]
            ]
        , div
            [ class "drop-zone"
            , attribute "data-hover"
                (if model.dropZoneHovering then
                    "true"

                 else
                    "false"
                )
            , preventDefaultOn "dragenter" (Decode.succeed ( DragEnter, True ))
            , preventDefaultOn "dragover" (Decode.succeed ( DragEnter, True ))
            , preventDefaultOn "dragleave" (Decode.succeed ( DragLeave, True ))
            , preventDefaultOn "drop" (Decode.map (\msg -> ( msg, True )) dropEventDecoder)
            ]
            [ span [] [ text "ここにファイルをドロップ" ] ]
        , case model.fileSelectError of
            Just err ->
                p [ class "error" ]
                    [ case err of
                        UnsupportedMime mime ->
                            text ("MIMEタイプは 'image/png' のみサポートされています (渡されたファイルのMIME='" ++ mime ++ "')")
                    ]

            Nothing ->
                text ""
        , ul [ class "files" ]
            (List.map
                (\item ->
                    li
                        [ class "files-item" ]
                        [ span [] [ text item.file.name ]
                        , button
                            [ class "button"
                            , attribute "data-size" "small"
                            , onClick (RemoveItem item)
                            ]
                            [ text "削除" ]
                        ]
                )
                model.items
            )
        , canvas [ id "canvas", class "canvas", width 0, height 0 ] []
        ]
    }



-- SUBSCRIPTIONS


imageDecoder : Decode.Decoder Image
imageDecoder =
    Decode.map3
        Image
        (Decode.field "width" Decode.int)
        (Decode.field "height" Decode.int)
        Decode.value


itemDecoder : Decode.Decoder ConcatItem
itemDecoder =
    Decode.map2
        ConcatItem
        (Decode.field "file" fileDecoder)
        (Decode.field "image" imageDecoder)


subscriptions : Model -> Sub Msg
subscriptions _ =
    recieveCreatedImage
        (\value ->
            case Decode.decodeValue itemDecoder value of
                Ok item ->
                    GotItem item

                Err _ ->
                    NoOp
        )
