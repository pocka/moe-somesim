module PathTest exposing (tests)

import Expect
import Path exposing (fromString, resolve, toString)
import Test exposing (Test, describe, test)


tests : Test
tests =
    describe "module Path"
        [ describe "resolve"
            [ test "絶対パスはそのまま返す" <|
                \_ ->
                    resolve
                        (fromString "/hoge/fuga/piyo")
                        (fromString "/foo/bar/baz")
                        |> toString
                        |> Expect.equal "/foo/bar/baz"
            , test "絶対パス内にトラバース系の指定があれば解決する" <|
                \_ ->
                    resolve
                        (fromString "/foo/bar/baz")
                        (fromString "/one/two/../three")
                        |> toString
                        |> Expect.equal "/one/three"
            , test "相対パスの場合はベースパスを基に解決する" <|
                \_ ->
                    resolve
                        (fromString "/one/two/")
                        (fromString "three/four")
                        |> toString
                        |> Expect.equal "/one/two/three/four"
            , test "ベースパスがスラッシュで終わっていない場合はディレクトリから解決する" <|
                \_ ->
                    resolve
                        (fromString "/one/two/ignored")
                        (fromString "three/four")
                        |> toString
                        |> Expect.equal "/one/two/three/four"
            , test "'..' がある場合は親ディレクトリを辿る" <|
                \_ ->
                    resolve
                        (fromString "/one/two/three/")
                        (fromString "../four/five/")
                        |> toString
                        |> Expect.equal "/one/two/four/five/"
            , test "'..' が複数あっても親を辿る" <|
                \_ ->
                    resolve
                        (fromString "/one/two/three/")
                        (fromString "../../four")
                        |> toString
                        |> Expect.equal "/one/four"
            , test "'..' はルートを越境しない" <|
                \_ ->
                    resolve
                        (fromString "/one/two/three")
                        (fromString "../../../../../../../four")
                        |> toString
                        |> Expect.equal "/four"
            , test "ベースパスが空の場合はルートから解決する" <|
                \_ ->
                    resolve
                        (fromString "")
                        (fromString "../../foo/../bar/baz")
                        |> toString
                        |> Expect.equal "/bar/baz"
            , test "空のパスが渡された場合はベースパスを返す" <|
                \_ ->
                    resolve
                        (fromString "/one/two/three")
                        (fromString "")
                        |> toString
                        |> Expect.equal "/one/two/three"
            , test "ルートパスの場合はそのまま返す" <|
                \_ ->
                    resolve
                        (fromString "/one/two/three")
                        (fromString "/")
                        |> toString
                        |> Expect.equal "/"
            , test "スラッシュが重なっていても処理する" <|
                \_ ->
                    resolve
                        (fromString "/one/two/three")
                        (fromString "four///five")
                        |> toString
                        |> Expect.equal "/one/two/four///five"
            , test "'.' は現在のディレクトリで置き換える" <|
                \_ ->
                    resolve
                        (fromString "/one/two/three")
                        (fromString "./four/five/./../six/.")
                        |> toString
                        |> Expect.equal "/one/two/four/six"
            ]
        ]
