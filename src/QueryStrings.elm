module QueryStrings exposing (QueryStrings, deleteAll, empty, fromString, get, getAll, has, prepend, toString)

import Url exposing (percentDecode, percentEncode)


{-| Elm公式のパス/クエリパラメータ周りは色々と非常におざなりなため
独自実装している。
-}
type QueryStrings
    = QueryStrings (List ( String, Maybe String ))


empty : QueryStrings
empty =
    QueryStrings []


{-| 文字列をパースしてクエリパラメータを生成する。
-}
fromString : String -> QueryStrings
fromString str =
    str
        |> String.split "&"
        |> List.map
            (\s ->
                case String.split "=" s of
                    [ key ] ->
                        percentDecode key
                            |> Maybe.map (\decoded -> ( decoded, Nothing ))

                    [ key, value ] ->
                        Maybe.map2
                            (\k -> \v -> ( k, Just v ))
                            (percentDecode key)
                            (percentDecode value)

                    _ ->
                        Nothing
            )
        |> List.filterMap identity
        |> QueryStrings


{-| クエリパラメータを文字列に変換する。
-}
toString : QueryStrings -> String
toString q =
    case q of
        QueryStrings ts ->
            ts
                |> List.map
                    (\( key, maybeValue ) ->
                        case maybeValue of
                            Just value ->
                                percentEncode key ++ "=" ++ percentEncode value

                            Nothing ->
                                percentEncode key
                    )
                |> String.join "&"


{-| クエリパラメータに該当するキーが存在するかを返す。
値の有無は問わない。
-}
has : String -> QueryStrings -> Bool
has key qs =
    case qs of
        QueryStrings [] ->
            False

        QueryStrings (( k, _ ) :: xs) ->
            if k == key then
                True

            else
                has key (QueryStrings xs)


{-| クエリパラメータに該当キーがあり、かつ値が設定されている場合はその値を返す。
キーのみ、もしくは該当するキーが存在しない場合は `Nothing` を返す。
-}
get : String -> QueryStrings -> Maybe String
get key qs =
    case qs of
        QueryStrings [] ->
            Nothing

        QueryStrings (( k, Just value ) :: xs) ->
            if k == key then
                Just value

            else
                get key (QueryStrings xs)

        QueryStrings (( _, Nothing ) :: xs) ->
            get key (QueryStrings xs)


{-| クエリパラメータの該当するキーの値を全て返す。
該当するキーが存在しない場合は `Nothing` を返す。

キーのみ指定されている場合は結果のリストには含まれない。
そのため、該当するキーが一つ以上存在するか全て値なしの場合は空のリストが返る。

-}
getAll : String -> QueryStrings -> Maybe (List String)
getAll key qs =
    case qs of
        QueryStrings [] ->
            Nothing

        QueryStrings (( k, Just value ) :: xs) ->
            if k == key then
                Just (value :: (getAll key (QueryStrings xs) |> Maybe.withDefault []))

            else
                getAll key (QueryStrings xs)

        QueryStrings (( _, Nothing ) :: xs) ->
            Just (getAll key (QueryStrings xs) |> Maybe.withDefault [])


{-| 指定されたキーを全て削除する。
-}
deleteAll : String -> QueryStrings -> QueryStrings
deleteAll key qs =
    case qs of
        QueryStrings ts ->
            ts
                |> List.filter (\( k, _ ) -> not (k == key))
                |> QueryStrings


{-| キーと値を追加する。
キーのみの場合は `value` に `Nothing` を指定する。
-}
prepend : String -> Maybe String -> QueryStrings -> QueryStrings
prepend key value qs =
    case qs of
        QueryStrings ts ->
            QueryStrings (( key, value ) :: ts)
