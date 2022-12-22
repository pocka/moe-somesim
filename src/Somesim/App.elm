module Somesim.App exposing (..)

import Browser
import Html exposing (..)



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


type alias Model =
    {}


init : () -> ( Model, Cmd Msg )
init _ =
    ( {}, Cmd.none )



-- UPDATE


type Msg
    = NoOp


update : Msg -> Model -> ( Model, Cmd msg )
update _ model =
    ( model, Cmd.none )



-- VIEW


view : Model -> Browser.Document Msg
view _ =
    { title = "そめしむ"
    , body =
        [ div [] [ text "Hello, World!" ]
        ]
    }



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none
