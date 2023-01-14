module Helpers.Builder exposing (main)

import Browser
import File
import File.Download as Download
import Filesize
import Helpers.ImageConcat exposing (Msg(..))
import Helpers.ObjectUrl as ObjectUrl exposing (ObjectUrl)
import Html exposing (..)
import Html.Attributes exposing (attribute, class, disabled, property)
import Html.Events exposing (on, onClick)
import Json.Decode as Decode
import Json.Encode as Encode
import Somesim.Flower as Flower



-- MAIN


main : Program () Model Msg
main =
    Browser.document
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type VideoFrame
    = VideoFrame Float


type alias FileRef =
    { url : ObjectUrl
    , file : File.File
    }


type alias ClipRect =
    { x : Int
    , y : Int
    , width : Int
    , height : Int
    }


type SceneKind
    = VideoSelectionScene
    | FrameSelectionScene
    | CropScene
    | AnotherVideoSelectionScene
    | MatchFrameSeekScene
    | StainScene
    | OutputScene


type SceneState a
    = Done a
    | InProgress


type alias Scenes =
    { videoSelection : SceneState FileRef
    , frameSelection : SceneState VideoFrame
    , crop : SceneState ClipRect
    , anotherVideoSelection : SceneState FileRef
    , matchFrameSeek : SceneState VideoFrame
    , stain : ( Flower.FlowerColor, Flower.FlowerColor )
    , output : SceneState String
    }


type alias Model =
    { scenes : Scenes
    , currentScene : SceneKind
    , previewStain : Flower.FlowerColor
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { scenes =
            { videoSelection = InProgress
            , frameSelection = InProgress
            , crop = InProgress
            , anotherVideoSelection = InProgress
            , matchFrameSeek = InProgress
            , stain = ( Flower.black, Flower.black )
            , output = InProgress
            }
      , currentScene = VideoSelectionScene
      , previewStain = Flower.black
      }
    , Cmd.none
    )



-- UPDATE


type Msg
    = SetFirstVideo FileRef
    | SetFirstFrame VideoFrame
    | SetCropRegion ClipRect
    | SetSecondVideo FileRef
    | SetMatchingFrame VideoFrame
    | UpdateStainA (Flower.FlowerColor -> Flower.FlowerColor)
    | UpdateStainB (Flower.FlowerColor -> Flower.FlowerColor)
    | GotGeneratedImage String
    | SetPreviewStain Flower.FlowerColor
    | RequestObjectUrl Decode.Value
    | GoTo SceneKind
    | DownloadOutput
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SetFirstVideo url ->
            let
                scenes =
                    model.scenes
            in
            ( { model
                | scenes =
                    { scenes
                        | videoSelection = Done url
                        , frameSelection = InProgress
                        , crop = InProgress
                        , matchFrameSeek = InProgress
                    }
              }
            , case model.scenes.videoSelection of
                Done ref ->
                    ObjectUrl.revoke ref.url

                InProgress ->
                    Cmd.none
            )

        SetFirstFrame frame ->
            let
                scenes =
                    model.scenes
            in
            ( { model | scenes = { scenes | frameSelection = Done frame } }
            , Cmd.none
            )

        SetCropRegion rect ->
            let
                scenes =
                    model.scenes
            in
            ( { model | scenes = { scenes | crop = Done rect, matchFrameSeek = InProgress } }, Cmd.none )

        SetSecondVideo ref ->
            let
                scenes =
                    model.scenes
            in
            ( { model
                | scenes =
                    { scenes | anotherVideoSelection = Done ref, matchFrameSeek = InProgress }
              }
            , case model.scenes.anotherVideoSelection of
                Done prev ->
                    ObjectUrl.revoke prev.url

                InProgress ->
                    Cmd.none
            )

        SetMatchingFrame frame ->
            let
                scenes =
                    model.scenes
            in
            ( { model | scenes = { scenes | matchFrameSeek = Done frame } }
            , Cmd.none
            )

        UpdateStainA f ->
            let
                scenes =
                    model.scenes
            in
            ( { model | scenes = { scenes | stain = scenes.stain |> Tuple.mapFirst f } }
            , Cmd.none
            )

        UpdateStainB f ->
            let
                scenes =
                    model.scenes
            in
            ( { model | scenes = { scenes | stain = scenes.stain |> Tuple.mapSecond f } }
            , Cmd.none
            )

        GotGeneratedImage url ->
            let
                scenes =
                    model.scenes
            in
            ( { model | scenes = { scenes | output = Done url } }
            , Cmd.none
            )

        SetPreviewStain stain ->
            ( { model | previewStain = stain }, Cmd.none )

        DownloadOutput ->
            case model.scenes.output of
                Done url ->
                    ( model, Download.url url )

                _ ->
                    ( model, Cmd.none )

        RequestObjectUrl value ->
            ( model, ObjectUrl.create value )

        GoTo scene ->
            ( { model | currentScene = scene }, Cmd.none )

        NoOp ->
            ( model, Cmd.none )



-- VIEW


sceneKindToName : SceneKind -> String
sceneKindToName kind =
    case kind of
        VideoSelectionScene ->
            "動画選択 (1)"

        FrameSelectionScene ->
            "フレーム選択"

        CropScene ->
            "サイズ指定"

        AnotherVideoSelectionScene ->
            "動画選択 (2)"

        MatchFrameSeekScene ->
            "近似フレーム検索"

        StainScene ->
            "染色液指定"

        OutputScene ->
            "結果出力"


sceneNavItem : Scenes -> SceneKind -> SceneKind -> Html msg
sceneNavItem scenes currentScene kind =
    let
        isInProgress =
            case kind of
                VideoSelectionScene ->
                    scenes.videoSelection == InProgress

                FrameSelectionScene ->
                    scenes.frameSelection == InProgress

                CropScene ->
                    scenes.crop == InProgress

                AnotherVideoSelectionScene ->
                    scenes.anotherVideoSelection == InProgress

                MatchFrameSeekScene ->
                    scenes.matchFrameSeek == InProgress

                StainScene ->
                    False

                OutputScene ->
                    scenes.output == InProgress
    in
    li
        [ class "steps--step"
        , if isInProgress then
            class ""

          else
            attribute "data-done" ""
        , if kind == currentScene then
            attribute "aria-current" "step"

          else
            class ""
        ]
        [ text (sceneKindToName kind) ]


sceneNav : Model -> Html Msg
sceneNav { scenes, currentScene } =
    ol
        [ class "steps" ]
        ([ VideoSelectionScene
         , FrameSelectionScene
         , CropScene
         , AnotherVideoSelectionScene
         , MatchFrameSeekScene
         , StainScene
         , OutputScene
         ]
            |> List.map (sceneNavItem scenes currentScene)
        )


onInputFile : (Decode.Value -> msg) -> Html.Attribute msg
onInputFile f =
    Decode.at [ "currentTarget", "files", "0" ] Decode.value
        |> Decode.map f
        |> Html.Events.on "change"


videoSelection : Model -> List (Html Msg)
videoSelection model =
    [ div [ class "page-header" ]
        [ button
            [ class "button"
            , disabled (model.scenes.videoSelection == InProgress)
            , onClick (GoTo FrameSelectionScene)
            ]
            [ text "次へ" ]
        ]
    , div [ class "page-body" ]
        [ p
            [ class "page-description" ]
            [ text "染色液Aで染めた状態で撮影した動画ファイルを選択してください。" ]
        , div [ class "selected-file" ]
            [ span [ class "selected-file--label" ] [ text "選択中のファイル" ]
            , span [ class "selected-file--value" ]
                [ case model.scenes.videoSelection of
                    Done { file } ->
                        text (File.name file ++ " (" ++ Filesize.format (File.size file) ++ ")")

                    InProgress ->
                        text "未選択"
                ]
            ]
        , label [ class "button" ]
            [ input
                [ Html.Attributes.type_ "file"
                , Html.Attributes.accept "video/*"
                , Html.Attributes.hidden True
                , onInputFile RequestObjectUrl
                ]
                []
            , text "選択する"
            ]
        ]
    ]


anotherVideoSelection : Model -> List (Html Msg)
anotherVideoSelection model =
    [ div [ class "page-header" ]
        [ button
            [ class "button"
            , onClick (GoTo CropScene)
            ]
            [ text "前へ" ]
        , button
            [ class "button"
            , disabled (model.scenes.anotherVideoSelection == InProgress)
            , onClick (GoTo MatchFrameSeekScene)
            ]
            [ text "次へ" ]
        ]
    , div [ class "page-body" ]
        [ p
            [ class "page-description" ]
            [ text "染色液Bで染めた状態で撮影した動画ファイルを選択してください。" ]
        , div [ class "selected-file" ]
            [ span [ class "selected-file--label" ] [ text "選択中のファイル" ]
            , span [ class "selected-file--value" ]
                [ case model.scenes.anotherVideoSelection of
                    Done { file } ->
                        text (File.name file ++ " (" ++ Filesize.format (File.size file) ++ ")")

                    InProgress ->
                        text "未選択"
                ]
            ]
        , label [ class "button" ]
            [ input
                [ Html.Attributes.type_ "file"
                , Html.Attributes.accept "video/*"
                , Html.Attributes.hidden True
                , onInputFile RequestObjectUrl
                ]
                []
            , text "選択する"
            ]
        ]
    ]


getCurrentFrameThen : (VideoFrame -> msg) -> Decode.Decoder msg
getCurrentFrameThen msg =
    Decode.at [ "currentTarget", "currentTime" ] Decode.float
        |> Decode.map VideoFrame
        |> Decode.map msg


frameSelection : Model -> List (Html Msg)
frameSelection model =
    [ div [ class "page-header" ]
        [ button
            [ class "button"
            , onClick (GoTo VideoSelectionScene)
            ]
            [ text "前へ" ]
        , button
            [ class "button"
            , disabled (model.scenes.frameSelection == InProgress)
            , onClick (GoTo CropScene)
            ]
            [ text "次へ" ]
        ]
    , div [ class "page-body" ]
        (case model.scenes.videoSelection of
            Done { url } ->
                [ p
                    [ class "page-description" ]
                    [ text "切り出すフレームで一時停止してから次へ進んでください。" ]
                , video
                    [ class "video-preview"
                    , Html.Attributes.src (ObjectUrl.toString url)
                    , Html.Attributes.controls True
                    , property "muted" (Encode.bool True)
                    , case model.scenes.frameSelection of
                        Done (VideoFrame frame) ->
                            property "currentTime" (Encode.float frame)

                        _ ->
                            class ""
                    , on "pause" (getCurrentFrameThen SetFirstFrame)
                    ]
                    []
                ]

            InProgress ->
                [ p [] [ text "動画ファイルが未指定です。" ] ]
        )
    ]


onRegionResize : (ClipRect -> msg) -> Attribute msg
onRegionResize msg =
    let
        rectDecoder : Decode.Decoder ClipRect
        rectDecoder =
            Decode.map4
                ClipRect
                (Decode.field "x" Decode.int)
                (Decode.field "y" Decode.int)
                (Decode.field "width" Decode.int)
                (Decode.field "height" Decode.int)
    in
    on "region-resize" (Decode.field "detail" (Decode.map msg rectDecoder))


crop : Model -> List (Html Msg)
crop model =
    [ div [ class "page-header" ]
        [ button
            [ class "button"
            , onClick (GoTo FrameSelectionScene)
            ]
            [ text "前へ" ]
        , button
            [ class "button"
            , disabled (model.scenes.crop == InProgress)
            , onClick (GoTo AnotherVideoSelectionScene)
            ]
            [ text "次へ" ]
        ]
    , div [ class "page-body" ]
        (case ( model.scenes.videoSelection, model.scenes.frameSelection ) of
            ( Done { url }, Done (VideoFrame frame) ) ->
                [ p
                    [ class "page-description" ]
                    [ text "画像として切り出す領域を指定してください。" ]
                , node "video-cropper"
                    ([ attribute "video-src" (ObjectUrl.toString url)
                     , attribute "video-frame" (String.fromFloat frame)
                     , onRegionResize SetCropRegion
                     ]
                        ++ (case model.scenes.crop of
                                Done { x, y, width, height } ->
                                    [ attribute "region-x" (String.fromInt x)
                                    , attribute "region-y" (String.fromInt y)
                                    , attribute "region-width" (String.fromInt width)
                                    , attribute "region-height" (String.fromInt height)
                                    ]

                                InProgress ->
                                    []
                           )
                    )
                    []
                , case model.scenes.crop of
                    Done { x, y, width, height } ->
                        p
                            []
                            [ text
                                (String.fromInt width
                                    ++ "x"
                                    ++ String.fromInt height
                                    ++ " @ "
                                    ++ String.fromInt x
                                    ++ ","
                                    ++ String.fromInt y
                                )
                            ]

                    InProgress ->
                        text ""
                ]

            _ ->
                [ p [ class "page-description" ] [ text "動画・フレームが未指定です" ] ]
        )
    ]


onFrameChange : Attribute Msg
onFrameChange =
    on
        "frame-change"
        (Decode.at [ "detail", "frame" ] Decode.float
            |> Decode.map
                (\n ->
                    SetMatchingFrame (VideoFrame n)
                )
        )


matchFrameSeek : Model -> List (Html Msg)
matchFrameSeek model =
    [ div [ class "page-header" ]
        [ button
            [ class "button"
            , onClick (GoTo AnotherVideoSelectionScene)
            ]
            [ text "前へ" ]
        , button
            [ class "button"
            , disabled (model.scenes.matchFrameSeek == InProgress)
            , onClick (GoTo StainScene)
            ]
            [ text "次へ" ]
        ]
    , div [ class "page-body" ]
        (case ( ( model.scenes.videoSelection, model.scenes.frameSelection ), ( model.scenes.anotherVideoSelection, model.scenes.crop ) ) of
            ( ( Done videoA, Done (VideoFrame frame) ), ( Done videoB, Done { x, y, width, height } ) ) ->
                [ p
                    [ class "page-description" ]
                    [ text "染色マスクがキレイに表示されるフレームまで移動してください。染色領域にだけ色が乗り、他の部分がキレイに黒くなっている状態が理想です。" ]
                , node "match-frame-seeker"
                    [ attribute "a-src" (ObjectUrl.toString videoA.url)
                    , attribute "b-src" (ObjectUrl.toString videoB.url)
                    , attribute "a-frame" (String.fromFloat frame)
                    , attribute "region-x" (String.fromInt x)
                    , attribute "region-y" (String.fromInt y)
                    , attribute "region-width" (String.fromInt width)
                    , attribute "region-height" (String.fromInt height)
                    , case model.scenes.matchFrameSeek of
                        Done (VideoFrame bFrame) ->
                            attribute "b-frame" (String.fromFloat bFrame)

                        InProgress ->
                            class ""
                    , onFrameChange
                    ]
                    []
                ]

            _ ->
                [ p [ class "page-description" ] [ text "染色液A/Bで染めた動画2つとフレーム、切り出し領域の指定がされていません。" ] ]
        )
    ]


onColorSelected : (Flower.PercentageColor -> msg) -> Attribute msg
onColorSelected f =
    on "input"
        (Decode.at [ "currentTarget", "value" ] Decode.string
            |> Decode.andThen
                (\s ->
                    String.toInt s
                        |> Maybe.andThen (\n -> Flower.findValueByIndex n Flower.predefinedValues)
                        |> Maybe.map f
                        |> Maybe.map Decode.succeed
                        |> Maybe.withDefault (Decode.fail "")
                )
        )


stainSelection : Model -> List (Html Msg)
stainSelection model =
    let
        colorOptions default =
            Flower.predefinedValues
                |> List.map
                    (\color ->
                        option
                            [ Html.Attributes.value (String.fromInt color.index)
                            , Html.Attributes.selected (default == color)
                            ]
                            [ text (String.fromInt color.percentage ++ "%") ]
                    )

        ( stainA, stainB ) =
            model.scenes.stain
    in
    [ div [ class "page-header" ]
        [ button
            [ class "button"
            , onClick (GoTo MatchFrameSeekScene)
            ]
            [ text "前へ" ]
        , button
            [ class "button"
            , disabled (model.scenes.matchFrameSeek == InProgress)
            , onClick (GoTo OutputScene)
            ]
            [ text "次へ" ]
        ]
    , div [ class "page-body" ]
        [ p [ class "page-description" ] [ text "染色液Aと染色液Bの色を指定してください。" ]
        , label [ class "stain--label" ]
            [ span [] [ text "染色液A" ]
            , node "app-color-swatch"
                [ attribute "value" ("#" ++ Flower.flowerColorToHex stainA) ]
                []
            ]
        , select
            [ onColorSelected (\r -> UpdateStainA (\c -> { c | r = r })) ]
            (colorOptions stainA.r)
        , select
            [ onColorSelected (\g -> UpdateStainA (\c -> { c | g = g })) ]
            (colorOptions stainA.g)
        , select
            [ onColorSelected (\b -> UpdateStainA (\c -> { c | b = b })) ]
            (colorOptions stainA.b)
        , label [ class "stain--label" ]
            [ span [] [ text "染色液B" ]
            , node "app-color-swatch"
                [ attribute "value" ("#" ++ Flower.flowerColorToHex stainB) ]
                []
            ]
        , select
            [ onColorSelected (\r -> UpdateStainB (\c -> { c | r = r })) ]
            (colorOptions stainB.r)
        , select
            [ onColorSelected (\g -> UpdateStainB (\c -> { c | g = g })) ]
            (colorOptions stainB.g)
        , select
            [ onColorSelected (\b -> UpdateStainB (\c -> { c | b = b })) ]
            (colorOptions stainB.b)
        ]
    ]


onGenerated : Attribute Msg
onGenerated =
    on "generate" (Decode.at [ "detail", "url" ] Decode.string |> Decode.map GotGeneratedImage)


previewStains : List Flower.FlowerColor
previewStains =
    [ Flower.black
    , Flower.white
    , Flower.red
    , Flower.green
    , Flower.blue
    ]


output : Model -> List (Html Msg)
output model =
    let
        ( stainA, stainB ) =
            model.scenes.stain
    in
    [ div [ class "page-header" ]
        [ button
            [ class "button"
            , onClick (GoTo StainScene)
            ]
            [ text "前へ" ]
        , button
            [ class "button"
            , onClick DownloadOutput
            ]
            [ text "ダウンロード" ]
        ]
    , div [ class "page-body" ]
        (case ( ( model.scenes.videoSelection, model.scenes.frameSelection ), ( model.scenes.anotherVideoSelection, model.scenes.crop ), model.scenes.matchFrameSeek ) of
            ( ( Done videoA, Done (VideoFrame frameA) ), ( Done videoB, Done { x, y, width, height } ), Done (VideoFrame frameB) ) ->
                [ p
                    [ class "page-description" ]
                    [ text "合成結果です。" ]
                , div
                    [ class "output-stains" ]
                    (previewStains
                        |> List.map
                            (\s ->
                                node "app-color-swatch"
                                    [ attribute "value" ("#" ++ Flower.flowerColorToHex s)
                                    , attribute "interactive" ""
                                    , onClick (SetPreviewStain s)
                                    ]
                                    []
                            )
                    )
                , div
                    [ class "output-images" ]
                    [ node "somesim-generator"
                        [ attribute "src-a" (ObjectUrl.toString videoA.url)
                        , attribute "src-b" (ObjectUrl.toString videoB.url)
                        , attribute "frame-a" (String.fromFloat frameA)
                        , attribute "frame-b" (String.fromFloat frameB)
                        , attribute "stain-a" (Flower.flowerColorToHex stainA)
                        , attribute "stain-b" (Flower.flowerColorToHex stainB)
                        , attribute "region-x" (String.fromInt x)
                        , attribute "region-y" (String.fromInt y)
                        , attribute "region-width" (String.fromInt width)
                        , attribute "region-height" (String.fromInt height)
                        , onGenerated
                        ]
                        []
                    , case model.scenes.output of
                        Done url ->
                            node "somesim-renderer"
                                [ attribute "src" url
                                , attribute "color" (Flower.flowerColorToHex model.previewStain)
                                ]
                                []

                        _ ->
                            div [] []
                    ]
                ]

            _ ->
                [ p [ class "page-description" ] [ text "前工程が完了していません。" ] ]
        )
    ]


view : Model -> Browser.Document Msg
view model =
    { title = sceneKindToName model.currentScene ++ " - そめしむ画像生成ツール"
    , body =
        [ div [ class "layout" ]
            [ sceneNav model
            , div
                [ class "page" ]
                (case model.currentScene of
                    VideoSelectionScene ->
                        videoSelection model

                    FrameSelectionScene ->
                        frameSelection model

                    CropScene ->
                        crop model

                    AnotherVideoSelectionScene ->
                        anotherVideoSelection model

                    MatchFrameSeekScene ->
                        matchFrameSeek model

                    StainScene ->
                        stainSelection model

                    OutputScene ->
                        output model
                )
            ]
        ]
    }



-- SUBSCRIPTION


subscriptions : Model -> Sub Msg
subscriptions model =
    case model.currentScene of
        VideoSelectionScene ->
            ObjectUrl.onCreated
                (\r ->
                    case r of
                        Ok ( url, file ) ->
                            SetFirstVideo { file = file, url = url }

                        _ ->
                            NoOp
                )

        AnotherVideoSelectionScene ->
            ObjectUrl.onCreated
                (\r ->
                    case r of
                        Ok ( url, file ) ->
                            SetSecondVideo { file = file, url = url }

                        _ ->
                            NoOp
                )

        _ ->
            Sub.none
