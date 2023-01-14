declare module "*.elm" {
  type ElmToJsPort<Msg> = {
    subscribe(cb: (msg: Msg) => void): () => void;
  };

  type JsToElmPort<Msg> = {
    send(msg: Msg): void;
  };

  interface SomesimAppFlags {
    baseUrl: string;
    bugReportingUrl: string;
    repositoryUrl: string;
    manualUrl: string;
    authors: readonly { name: string; email: string | null }[];
    version: string;
  }

  type SomesimAppElmToJsMsg =
    | { type: "SendDialogImperativeClose"; id: string }
    | { type: "SendDialogImperativeOpen"; id: string }
    | { type: "SendPreviewZoom"; zoom: number }
    | { type: "SendPreviewZoomReset" };

  interface SomesimAppApp {
    ports: {
      elmToJsPort: ElmToJsPort<SomesimAppElmToJsMsg>;
    };
  }

  interface HelpersBuilderApp {
    ports: {
      createObjectUrl: ElmToJsPort<File>;
      revokeObjectUrl: ElmToJsPort<string>;
      receiveObjectUrl: JsToElmPort<{
        url: string;
        file: File;
      }>;
    };
  }

  export const Elm: {
    Somesim: {
      App: {
        init(opts: { flags: SomesimAppFlags }): SomesimAppApp;
      };
    };

    Helpers: {
      ImageConcat: {
        init(): any;
      };

      Builder: {
        init(): HelpersBuilderApp;
      };
    };
  };
}
