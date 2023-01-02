module Somesim.Flower exposing (Definition, Flower, FlowerColor, black, blendFlowerColors, decoder, definitionDecoder, flowerColorToHex, idToString, zero)

import Hex
import Json.Decode as Decode


{-| MoE上で表示される色の割合 (%) と実際のRGB値 (0~255) のペア。
-}
type alias PercentageColor =
    { index : Int
    , percentage : Int
    , rgb : Int
    }


zero : PercentageColor
zero =
    PercentageColor 0 0 0


predefinedValues : List PercentageColor
predefinedValues =
    [ zero
    , PercentageColor 1 3 8
    , PercentageColor 2 6 16
    , PercentageColor 3 9 24
    , PercentageColor 4 12 32
    , PercentageColor 5 16 41
    , PercentageColor 6 19 49
    , PercentageColor 7 22 57
    , PercentageColor 8 25 65
    , PercentageColor 9 29 74
    , PercentageColor 10 32 82
    , PercentageColor 11 35 90
    , PercentageColor 12 38 98
    , PercentageColor 13 41 106
    , PercentageColor 14 45 115
    , PercentageColor 15 48 123
    , PercentageColor 16 51 131
    , PercentageColor 17 54 139
    , PercentageColor 18 58 148
    , PercentageColor 19 61 156
    , PercentageColor 20 64 164
    , PercentageColor 21 67 172
    , PercentageColor 22 70 180
    , PercentageColor 23 74 189
    , PercentageColor 24 77 197
    , PercentageColor 25 80 205
    , PercentageColor 26 83 213
    , PercentageColor 27 87 222
    , PercentageColor 28 90 230
    , PercentageColor 29 93 238
    , PercentageColor 30 96 246
    , PercentageColor 31 100 255
    ]


type alias FlowerColor =
    { r : PercentageColor, g : PercentageColor, b : PercentageColor }


black : FlowerColor
black =
    FlowerColor zero zero zero


findValueByIndex : Int -> List PercentageColor -> Maybe PercentageColor
findValueByIndex i list =
    case list of
        [] ->
            Nothing

        x :: xs ->
            if x.index == i then
                Just x

            else
                findValueByIndex i xs


{-| 一つ以上の花びらの単一チャンネルの値を合成する
計算式ソース: <http://chou.deko8.jp/combine.html>
-}
blendChannel : List PercentageColor -> Maybe PercentageColor
blendChannel values =
    case values of
        [ a ] ->
            Just a

        [ a, b ] ->
            let
                index =
                    (a.index + b.index) * 33 // 64
            in
            findValueByIndex index predefinedValues

        [ a, b, c ] ->
            let
                index =
                    (a.index + b.index + c.index) * 34 // 99
            in
            findValueByIndex index predefinedValues

        [ a, b, c, d ] ->
            let
                index =
                    (a.index + b.index + c.index + d.index) * 33 // 128
            in
            findValueByIndex index predefinedValues

        _ ->
            Nothing


blendFlowerColors : List FlowerColor -> Maybe FlowerColor
blendFlowerColors colors =
    case colors of
        [] ->
            Nothing

        [ a ] ->
            Just a

        many ->
            Maybe.map3
                FlowerColor
                (blendChannel (List.map .r many))
                (blendChannel (List.map .g many))
                (blendChannel (List.map .b many))


findValueByPercentage : Int -> List PercentageColor -> Maybe PercentageColor
findValueByPercentage n list =
    case list of
        [] ->
            Nothing

        x :: xs ->
            if x.percentage == n then
                Just x

            else
                findValueByPercentage n xs


colorPercentageDecoder : Decode.Decoder PercentageColor
colorPercentageDecoder =
    Decode.int
        |> Decode.andThen
            (\n ->
                findValueByPercentage n predefinedValues
                    |> Maybe.map Decode.succeed
                    |> Maybe.withDefault (Decode.fail "定義されていない色の%値です")
            )


type FlowerId
    = FlowerId String


idToString : FlowerId -> String
idToString id =
    case id of
        FlowerId str ->
            str


flowerIdDecoder : Decode.Decoder FlowerId
flowerIdDecoder =
    Decode.string
        |> Decode.andThen
            (\str ->
                if String.startsWith "f_" str then
                    Decode.succeed (FlowerId str)

                else
                    Decode.fail "花びらのIDは `f_` から始まる必要があります"
            )


type alias Flower =
    { id : FlowerId
    , name : String
    , color : FlowerColor
    }


decoder : Decode.Decoder Flower
decoder =
    Decode.map3
        Flower
        (Decode.field "id" flowerIdDecoder)
        (Decode.field "name" Decode.string)
        (Decode.field "color" (Decode.map3 FlowerColor (Decode.index 0 colorPercentageDecoder) (Decode.index 1 colorPercentageDecoder) (Decode.index 2 colorPercentageDecoder)))


{-| 整数を 0x00 ~ 0xff の範囲に収めた上で2桁16進数文字列に変換する。
-}
toFF : Int -> String
toFF n =
    n
        |> max 0x00
        |> min 0xFF
        |> Hex.toString
        |> String.padLeft 2 '0'


flowerColorToHex : FlowerColor -> String
flowerColorToHex color =
    toFF color.r.rgb ++ toFF color.g.rgb ++ toFF color.b.rgb


type GroupId
    = GroupId String


groupIdDecoder : Decode.Decoder GroupId
groupIdDecoder =
    Decode.string
        |> Decode.andThen
            (\str ->
                if String.startsWith "r_" str then
                    Decode.succeed (GroupId str)

                else
                    Decode.fail "花びらグループのIDは `r_` から始まる必要があります"
            )


type alias Group =
    { id : GroupId
    , name : String
    , children : List Flower
    }


groupDecoder : Decode.Decoder Group
groupDecoder =
    Decode.map3
        Group
        (Decode.field "id" groupIdDecoder)
        (Decode.field "name" Decode.string)
        (Decode.field "children" (Decode.list decoder))


type alias Definition =
    List Group


definitionDecoder : Decode.Decoder Definition
definitionDecoder =
    Decode.list groupDecoder
