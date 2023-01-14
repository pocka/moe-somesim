port module Helpers.ObjectUrl exposing (ObjectUrl, create, onCreated, revoke, toString)

import File
import Json.Decode as Decode
import Json.Encode as Encode


port createObjectUrl : Encode.Value -> Cmd msg


port revokeObjectUrl : String -> Cmd msg


port receiveObjectUrl : (Decode.Value -> msg) -> Sub msg


type ObjectUrl
    = Internal String


toString : ObjectUrl -> String
toString o =
    case o of
        Internal s ->
            s


create : Encode.Value -> Cmd msg
create value =
    createObjectUrl value


revoke : ObjectUrl -> Cmd msg
revoke o =
    case o of
        Internal s ->
            revokeObjectUrl s


decoder : Decode.Decoder ( ObjectUrl, File.File )
decoder =
    Decode.map2
        Tuple.pair
        (Decode.field "url" Decode.string |> Decode.map Internal)
        (Decode.field "file" File.decoder)


onCreated : (Result Decode.Error ( ObjectUrl, File.File ) -> msg) -> Sub msg
onCreated f =
    receiveObjectUrl
        (\value ->
            value
                |> Decode.decodeValue decoder
                |> f
        )
