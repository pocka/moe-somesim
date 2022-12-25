module Path exposing (Path, fromString, resolve, toString)

{-| Elm 公式の Url モジュール (elm/url) にはパス系の関数が一切実装されておらず、
実際のプロジェクトで使えるようなものではない。そういった足りない部分を補うモジュール。
-}


{-| パスの内部表現。
-}
type Path
    = Path (List String)


{-| パス文字列をモジュールの型に変換する。
区切り文字は UNIX の "/" (スラッシュ) を用いる。
-}
fromString : String -> Path
fromString str =
    str
        |> String.split "/"
        |> Path


{-| モジュールの型を文字列に変換する。
-}
toString : Path -> String
toString path =
    case path of
        Path str ->
            String.join "/" str


resolveInternal : List String -> List String -> List String
resolveInternal cwdStack path =
    case ( cwdStack, path ) of
        ( _, [] ) ->
            cwdStack

        ( _, "." :: xs) ->
            resolveInternal cwdStack xs

        ( [], ".." :: xs ) ->
            resolveInternal [] xs

        ( _ :: parent, ".." :: xs ) ->
            resolveInternal parent xs

        ( _, x :: xs ) ->
            resolveInternal (x :: cwdStack) xs


{-| 2つ目のパスを1つ目のパスを用いて解決する。
2つ目のパスが絶対パスの場合は1つ目のパスは無視される。
また、2つ目のパスが空の場合は1つ目のパスを返す。
-}
resolve : Path -> Path -> Path
resolve basePath path =
    case ( basePath, path ) of
        ( _, Path [ "" ] ) ->
            basePath

        ( _, Path [] ) ->
            basePath

        ( _, Path ("" :: xs) ) ->
            Path (resolveInternal [] xs |> List.reverse |> (::) "")

        ( Path (_ :: b), Path p ) ->
            Path
                (resolveInternal
                    (List.reverse b |> List.tail |> Maybe.withDefault [])
                    p
                    |> List.reverse
                    |> (::) ""
                )

        ( Path [], Path xs ) ->
            Path (resolveInternal [] xs |> List.reverse |> (::) "")
