export type TargetStrategy = "css" | "aria" | "text" | "xpath" | "testId";

export type Target = {
    using: TargetStrategy;
    value: string;
    index?: number;
};

export type FlowApp = {
    basePath: string;
    workspaceMode: "read-only" | "temporary-copy";
    fixtureTimestamp?: string;
    preferences?: {
        locale?: "en" | "es" | "ca" | "gl" | "eu";
        theme?: "light" | "dark";
        typography?: "sans-serif" | "serif" | "modern" | "reading";
        sidebarVisible?: boolean;
        showHiddenFiles?: boolean;
        folderSort?: { attribute: "name" | "size" | "modified"; direction: "asc" | "desc" };
    };
    file?: string;
    width?: number;
    height?: number;
};

export type ClickStep = {
    action: "click" | "domClick" | "doubleClick" | "contextClick";
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
    action: "focus" | "hover" | "pointerOver" | "clear";
    target: Target;
};

export type CaretStep = {
    action: "caret";
    target: Target;
    position: "start" | "end";
};

export type PointerMoveStep = {
    action: "pointerMove";
    target: Target;
    xRatio?: number;
    yRatio?: number;
};

export type PointerDragStep = {
    action: "pointerDrag" | "domPointerDrag";
    target: Target;
    x: number;
    y: number;
    durationMs?: number;
};

export type SetRangeStep = {
    action: "setRange";
    target: Target;
    value: number;
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

export type WaitSelectionStep = {
    action: "waitSelection";
    target: Target;
    timeoutMs?: number;
};

export type WaitClipboardStep = {
    action: "waitClipboard";
    text: string;
    source?: "native" | "browser" | "write";
    timeoutMs?: number;
};

export type ObserveClipboardWriteStep = {
    action: "observeClipboardWrite";
    text: string;
};

export type RefreshStep = {
    action: "refresh";
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
    | CaretStep
    | PointerMoveStep
    | PointerDragStep
    | SetRangeStep
    | ScrollStep
    | SelectStep
    | DragStep
    | WaitStep
    | WaitSelectionStep
    | WaitClipboardStep
    | ObserveClipboardWriteStep
    | RefreshStep
    | CaptureStep;

export type AutomationFlow = {
    name: string;
    app: FlowApp;
    outputDir?: string;
    timeoutMs?: number;
    settleMs?: number;
    steps: FlowStep[];
};
