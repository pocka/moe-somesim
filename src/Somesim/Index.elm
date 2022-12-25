module Somesim.Index exposing (Id, Index(..), IndexMeta, decoder, find, getAncestors, idToString, stringToId)

import Json.Decode as Decode
import Path
import Url exposing (Url)


findList : (a -> Maybe a) -> List a -> Maybe a
findList f list =
    case list of
        [] ->
            Nothing

        x :: xs ->
            case f x of
                Just a ->
                    Just a

                Nothing ->
                    findList f xs


type Id
    = Id String


stringToId : String -> Id
stringToId str =
    Id str


idToString : Id -> String
idToString id =
    case id of
        Id str ->
            str


type alias IndexMeta =
    { id : Id
    , name : String
    }


{-| 装備画像とそのグルーピングを管理するインデックス。
-}
type Index
    = Group IndexMeta (List Index)
    | Item IndexMeta Url


{-| 渡された ID に一致するインデックスノード (Group もしくは Item) を取得する。
見つからない場合は Nothing が返る。
-}
find : Id -> Index -> Maybe Index
find id index =
    case index of
        Item meta _ ->
            if meta.id == id then
                Just index

            else
                Nothing

        Group meta children ->
            if meta.id == id then
                Just index

            else
                findList (find id) children


{-| 指定されたインデックスノードの祖先ノードを全て取得する。
先頭がルートインデックスで末尾が直近の親インデックスノードとなる。
`index` が `root` 内に存在しない場合は Nothing が返る。
`index` が `root` 自身の場合は空のリストが返る。
-}
getAncestors : Index -> Index -> Maybe (List Index)
getAncestors index root =
    if index == root then
        Just []

    else
        case root of
            Item _ _ ->
                Nothing

            Group _ children ->
                List.filterMap (getAncestors index) children
                    |> List.head
                    |> Maybe.map ((::) root)


indexMetaDecoder : Decode.Decoder IndexMeta
indexMetaDecoder =
    Decode.map2
        IndexMeta
        (Decode.field "id" Decode.string |> Decode.map Id)
        (Decode.field "name" Decode.string)


groupDecoder : Url -> Decode.Decoder Index
groupDecoder baseUrl =
    Decode.map2
        Group
        indexMetaDecoder
        (Decode.field "children" (Decode.list (Decode.lazy (\_ -> decoder baseUrl))))



itemDecoder : Url -> Decode.Decoder Index
itemDecoder baseUrl =
    Decode.map2
        Item
        indexMetaDecoder
        (Decode.field "image" Decode.string
            |> Decode.map
                (\path ->
                    { baseUrl
                        | path =
                            path
                                |> Path.fromString
                                |> Path.resolve (Path.fromString baseUrl.path)
                                |> Path.toString
                        , query = Nothing
                        , fragment = Nothing
                    }
                )
        )


{-| インデックスのデコーダー。
デコード時にURLを生成するためベースURLが引数として必要。
-}
decoder : Url -> Decode.Decoder Index
decoder baseUrl =
    Decode.oneOf
        [ groupDecoder baseUrl, itemDecoder baseUrl ]
