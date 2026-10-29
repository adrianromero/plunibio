export type TargetStrategy = "css" | "aria" | "text" | "xpath" | "testId";

export type Target = {
    using: TargetStrategy;
    value: string;
    index?: number;
};

export type FlowApp = {
    basePath: string;
    file?: string;
    width?: number;
    height?: number;
};

export type ClickStep = {
    action: "click" | "doubleClick" | "contextClick";
    target: Target;
    x?: number;
    y?: number;
};

export type TypeStep = {
    action: "type";
    target: Target;
    text: string;
    replace?: boolean;
};

export type KeyStep = {
    action: "keys";
    keys: string[];
    target?: Target;
};

export type FocusStep = {
    action: "focus" | "hover" | "clear";
    target: Target;
};

export type ScrollStep =
    | {
          action: "scroll";
          target?: Target;
          x?: number;
          y: number;
      }
    | {
          action: "scrollIntoView";
          target: Target;
          block?: "start" | "center" | "end" | "nearest";
      };

export type SelectStep = {
    action: "select";
    target: Target;
    by: "text" | "value" | "index";
    value: string | number;
};

export type DragStep = {
    action: "drag";
    from: Target;
    to: Target;
};

export type WaitStep =
    | {
          action: "pause";
          milliseconds: number;
      }
    | {
          action: "wait";
          target: Target;
          state?: "visible" | "hidden" | "existing" | "missing" | "enabled";
          timeoutMs?: number;
          text?: string;
      };

export type CaptureStep = {
    action: "capture";
    name: string;
    scope?: "viewport" | "element" | "native-window";
    target?: Target;
    includeCursor?: boolean;
    settleMs?: number;
};

export type FlowStep =
    | ClickStep
    | TypeStep
    | KeyStep
    | FocusStep
    | ScrollStep
    | SelectStep
    | DragStep
    | WaitStep
    | CaptureStep;

export type AutomationFlow = {
    name: string;
    app: FlowApp;
    outputDir?: string;
    timeoutMs?: number;
    settleMs?: number;
    steps: FlowStep[];
};
