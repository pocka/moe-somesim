module QueryStringsTest exposing (tests)

import Expect
import QueryStrings exposing (..)
import Test exposing (Test, describe, test)


tests : Test
tests =
    describe "module QueryStrings"
        [ describe "fromString"
            [ test "URLエンコードされていないものをパースする" <|
                \_ ->
                    fromString "a=b&c&d=e&d=f"
                        |> toString
                        |> Expect.equal "a=b&c&d=e&d=f"
            , test "キーをURLデコードする" <|
                \_ ->
                    fromString "foo%20bar"
                        |> has "foo bar"
                        |> Expect.equal True
            , test "値をURLデコードする" <|
                \_ ->
                    fromString "foo=bar%20baz"
                        |> get "foo"
                        |> Expect.equal (Just "bar baz")
            , test "同一キーが複数ある場合をサポートする" <|
                \_ ->
                    fromString "foo=bar&foo=baz&foo&foo=qux"
                        |> getAll "foo"
                        |> Expect.equal (Just [ "bar", "baz", "qux" ])
            ]
        , describe "deleteAll"
            [ test "キーを削除する" <|
                \_ ->
                    fromString "a=b&c&d=e"
                        |> deleteAll "a"
                        |> toString
                        |> Expect.equal "c&d=e"
            , test "複数ある場合は全て削除する" <|
                \_ ->
                    fromString "foo=bar&bar=baz&foo=baz"
                        |> deleteAll "foo"
                        |> toString
                        |> Expect.equal "bar=baz"
            ]
        , describe "prepend"
            [ test "キーを先頭に追加する" <|
                \_ ->
                    empty
                        |> prepend "foo" Nothing
                        |> toString
                        |> Expect.equal "foo"
            , test "キーと値を先頭に追加する" <|
                \_ ->
                    fromString "foo=bar&bar=baz"
                        |> prepend "qux" (Just "quux")
                        |> toString
                        |> Expect.equal "qux=quux&foo=bar&bar=baz"
            ]
        ]
