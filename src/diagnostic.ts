export interface Diagnostic {
  range: Range;
  message: string;
}

interface Range {
  start: Position;
  end: Position;
}

interface Position {
  line: number;
  character: number;
}
