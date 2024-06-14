export interface Diagnostic {
  range: Range;
  severity: DiagnosticSeverity;
  message: string;
}

export namespace DiagnosticSeverity {
  export const Error: 1 = 1;
  export const Warning: 2 = 2;
  export const Information: 3 = 3;
  export const Hint: 4 = 4;
}

type DiagnosticSeverity = 1 | 2 | 3 | 4;

export interface Range {
  start: Position;
  end: Position;
}

export interface Position {
  line: number;
  character: number;
}
