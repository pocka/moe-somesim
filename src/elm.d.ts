declare module "*.elm" {
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
    | { type: "SendDialogImperativeOpen"; id: string };

  interface SomesimAppApp {
    ports: {
      elmToJsPort: {
        subscribe(cb: (msg: SomesimAppElmToJsMsg) => void): () => void;
      };
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
    };
  };
}
