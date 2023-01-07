declare module "*.elm" {
  interface SomesimAppFlags {
    baseUrl: string;
  }

  interface SomesimAppApp {}

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
