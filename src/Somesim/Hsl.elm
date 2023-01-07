module Somesim.Hsl exposing (Hsl, toHex, toRgb)

import Basics.Extra exposing (fractionalModBy)
import Hex


type alias Hsl =
    { h : Int
    , s : Float
    , l : Float
    }


type alias Rgb =
    { r : Int
    , g : Int
    , b : Int
    }


{-| <https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative>
-}
toRgb : Hsl -> Rgb
toRgb hsl =
    let
        f n =
            let
                k =
                    fractionalModBy 12 (n + toFloat hsl.h / 30)

                a =
                    hsl.s * min hsl.l (1 - hsl.l)
            in
            hsl.l
                - a
                * max -1 (min (min (k - 3) (9 - k)) 1)
                |> (*) 255
                |> round
    in
    { r = f 0
    , g = f 8
    , b = f 4
    }


{-| 整数を 0x00 ~ 0xff の範囲に収めた上で2桁16進数文字列に変換する。
-}
toFF : Int -> String
toFF n =
    n
        |> max 0x00
        |> min 0xFF
        |> Hex.toString
        |> String.padLeft 2 '0'


toHex : Hsl -> String
toHex hsl =
    toRgb hsl
        |> (\{ r, g, b } -> toFF r ++ toFF g ++ toFF b)
