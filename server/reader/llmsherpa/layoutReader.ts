type BlockJson = {
  tag: string;
  level: number;
  page_idx: number;
  block_idx: number;
  top: number;
  left: number;
  bbox: number[];
  sentences: string[];
};

abstract class Block {
  tag: string | null;
  level: number;
  pageIdx: number;
  blockIdx: number;
  top: number;
  left: number;
  bbox: number[];
  sentences: string[];
  children: Block[];
  parent: Block | null;
  blockJson: BlockJson | null;

  constructor(blockJson: BlockJson | null = null) {
    this.tag = blockJson && 'tag' in blockJson ? blockJson.tag : null;
    this.level = blockJson && 'level' in blockJson ? blockJson.level : -1;
    this.pageIdx =
      blockJson && 'page_idx' in blockJson ? blockJson.page_idx : -1;
    this.blockIdx =
      blockJson && 'block_idx' in blockJson ? blockJson.block_idx : -1;
    this.top = blockJson && 'top' in blockJson ? blockJson.top : -1;
    this.left = blockJson && 'left' in blockJson ? blockJson.left : -1;
    this.bbox = blockJson && 'bbox' in blockJson ? blockJson.bbox : [];
    this.sentences =
      blockJson && 'sentences' in blockJson ? blockJson.sentences : [];
    this.children = [];
    this.parent = null;
    this.blockJson = blockJson;
  }

  addChild(node: Block): void {
    this.children.push(node);
    node.parent = this;
  }

  abstract toHtml(include_children?: boolean, recurse?: boolean): string;
  abstract toText(include_children?: boolean, recurse?: boolean): string;

  parentChain(): Block[] {
    const chain: Block[] = [];
    let parent = this.parent;
    while (parent) {
      chain.push(parent);
      parent = parent.parent;
    }
    chain.reverse();
    return chain;
  }

  parentText(): string {
    const parentChain = this.parentChain();
    const headerTexts: string[] = [];
    const paraTexts: string[] = [];
    for (const p of parentChain) {
      if (p.tag === 'header') {
        headerTexts.push(p.toText());
      } else if (p.tag !== 'list_item' && p.tag !== 'para') {
        paraTexts.push(p.toText());
      }
    }
    let text = headerTexts.join(' > ');
    if (paraTexts.length > 0) {
      text += paraTexts.join('\n');
    }
    return text;
  }

  toContextText(includeSectionInfo: boolean = true): string {
    let text = '';
    if (includeSectionInfo) {
      text += this.parentText() + '\n';
    }
    if (
      this.tag === 'list_item' ||
      this.tag === 'para' ||
      this.tag === 'table'
    ) {
      text += this.toText(true, true);
    } else {
      text += this.toText();
    }
    return text;
  }

  iterChildren(
    node: Block,
    level: number,
    nodeVisitor: (node: Block) => void,
  ): void {
    for (const child of node.children) {
      nodeVisitor(child);
      if (
        child.tag !== 'list_item' &&
        child.tag !== 'para' &&
        child.tag !== 'table'
      ) {
        this.iterChildren(child, level + 1, nodeVisitor);
      }
    }
  }

  paragraphs(): Block[] {
    const paragraphs: Block[] = [];
    const paraCollector = (node: Block) => {
      if (node.tag === 'para') {
        paragraphs.push(node);
      }
    };
    this.iterChildren(this, 0, paraCollector);
    return paragraphs;
  }

  chunks(): Block[] {
    const chunks: Block[] = [];
    const chunkCollector = (node: Block) => {
      if (
        node.tag === 'para' ||
        node.tag === 'list_item' ||
        node.tag === 'table'
      ) {
        chunks.push(node);
      }
    };
    this.iterChildren(this, 0, chunkCollector);
    return chunks;
  }

  tables(): Block[] {
    const tables: Block[] = [];
    const tableCollector = (node: Block) => {
      if (node.tag === 'table') {
        tables.push(node);
      }
    };
    this.iterChildren(this, 0, tableCollector);
    return tables;
  }

  sections(): Block[] {
    const sections: Block[] = [];
    const sectionCollector = (node: Block) => {
      if (node.tag === 'header') {
        sections.push(node);
      }
    };
    this.iterChildren(this, 0, sectionCollector);
    return sections;
  }
}

class Paragraph extends Block {
  toText(includeChildren: boolean = false, recurse: boolean = false): string {
    let paraText = this.sentences.join('\n');
    if (includeChildren) {
      for (const child of this.children) {
        paraText += '\n' + child.toText(recurse, recurse);
      }
    }
    return paraText;
  }

  toHtml(includeChildren: boolean = false, recurse: boolean = false): string {
    let htmlStr = '<p>';
    htmlStr += this.sentences.join('\n');
    if (includeChildren && this.children.length > 0) {
      htmlStr += '<ul>';
      for (const child of this.children) {
        htmlStr += child.toHtml(recurse, recurse);
      }
      htmlStr += '</ul>';
    }
    htmlStr += '</p>';
    return htmlStr;
  }
}

class Section extends Block {
  title: string;

  constructor(sectionJson: any) {
    super(sectionJson);
    this.title = this.sentences.join('\n');
  }

  toText(includeChildren: boolean = false, recurse: boolean = false): string {
    let text = this.title;
    if (includeChildren) {
      for (const child of this.children) {
        text += '\n' + child.toText(recurse, recurse);
      }
    }
    return text;
  }

  toHtml(includeChildren: boolean = false, recurse: boolean = false): string {
    let htmlStr = `<h${this.level + 1}>`;
    htmlStr += this.title;
    htmlStr += `</h${this.level + 1}>`;
    if (includeChildren) {
      for (const child of this.children) {
        htmlStr += child.toHtml(recurse, recurse);
      }
    }
    return htmlStr;
  }
}

class ListItem extends Block {
  toText(includeChildren: boolean = false, recurse: boolean = false): string {
    let text = this.sentences.join('\n');
    if (includeChildren) {
      for (const child of this.children) {
        text += '\n' + child.toText(recurse, recurse);
      }
    }
    return text;
  }

  toHtml(includeChildren: boolean = false, recurse: boolean = false): string {
    let htmlStr = '<li>';
    htmlStr += this.sentences.join('\n');
    if (includeChildren && this.children.length > 0) {
      htmlStr += '<ul>';
      for (const child of this.children) {
        htmlStr += child.toHtml(recurse, recurse);
      }
      htmlStr += '</ul>';
    }
    htmlStr += '</li>';
    return htmlStr;
  }
}

class TableCell extends Block {
  colSpan: number;
  cellValue: any;
  cellNode: Paragraph | null;

  constructor(cellJson: any) {
    super(cellJson);
    this.colSpan = 'col_span' in cellJson ? cellJson.col_span : 1;
    this.cellValue = cellJson.cell_value;
    if (typeof this.cellValue !== 'string') {
      this.cellNode = new Paragraph(this.cellValue);
    } else {
      this.cellNode = null;
    }
  }

  toText(): string {
    let cellText = this.cellValue;
    if (this.cellNode) {
      cellText = this.cellNode.toText();
    }
    return cellText;
  }

  toHtml(): string {
    let cellHtml = this.cellValue;
    if (this.cellNode) {
      cellHtml = this.cellNode.toHtml();
    }
    const htmlStr =
      this.colSpan === 1
        ? `<td colSpan=${this.colSpan}>${cellHtml}</td>`
        : `<td>${cellHtml}</td>`;
    return htmlStr;
  }
}

class TableRow extends Block {
  cells: TableCell[];

  constructor(rowJson: any) {
    super();
    this.cells = [];
    if (rowJson.type === 'full_row') {
      const cell = new TableCell(rowJson);
      this.cells.push(cell);
    } else {
      for (const cellJson of rowJson.cells) {
        const cell = new TableCell(cellJson);
        this.cells.push(cell);
      }
    }
  }

  toText(): string {
    return this.cells.map((cell) => cell.toText()).join(' | ');
  }

  toHtml(): string {
    return '<tr>' + this.cells.map((cell) => cell.toHtml()).join('') + '</tr>';
  }
}

class TableHeader extends Block {
  cells: TableCell[];

  constructor(rowJson: any) {
    super(rowJson);
    this.cells = rowJson.cells.map((cellJson: any) => new TableCell(cellJson));
  }

  toText(): string {
    const cellText = this.cells.map((cell) => cell.toText()).join(' | ');
    const separator = this.cells.map(() => '---').join(' | ');
    return cellText + '\n' + separator;
  }

  toHtml(): string {
    return '<th>' + this.cells.map((cell) => cell.toHtml()).join('') + '</th>';
  }
}

class Table extends Block {
  rows: TableRow[];
  headers: TableHeader[];
  name: string;

  constructor(tableJson: any, parent: Block) {
    super(tableJson);
    this.rows = [];
    this.headers = [];
    this.name = tableJson.name;
    if ('table_rows' in tableJson) {
      for (const rowJson of tableJson.table_rows) {
        if (rowJson.type === 'table_header') {
          const row = new TableHeader(rowJson);
          this.headers.push(row);
        } else {
          const row = new TableRow(rowJson);
          this.rows.push(row);
        }
      }
    }
  }

  toText(): string {
    return (
      this.headers.map((header) => header.toText()).join('\n') +
      '\n' +
      this.rows.map((row) => row.toText()).join('\n')
    );
  }

  toHtml(): string {
    return (
      '<table>' +
      this.headers.map((header) => header.toHtml()).join('') +
      this.rows.map((row) => row.toHtml()).join('') +
      '</table>'
    );
  }
}

class RootNode extends Block {
  toText(): string {
    return this.children.map((child) => child.toText()).join('\n');
  }

  toHtml(): string {
    return this.children.map((child) => child.toHtml()).join('');
  }
}

class LayoutReader {
  debug(pdfRoot: Block): void {
    const iterChildren = (node: Block, level: number) => {
      for (const child of node.children) {
        console.log(
          '-'.repeat(level),
          child.tag,
          `(${child.children.length})`,
          child.toText(),
        );
        iterChildren(child, level + 1);
      }
    };
    iterChildren(pdfRoot, 0);
  }

  read(blocksJson: any[]): Block {
    const root = new RootNode();
    const parentStack: Block[] = [root];
    let prevNode: Block = root;
    let parent: Block = root;
    const listStack: Block[] = [];

    for (const block of blocksJson) {
      let node: Block;

      if (block.tag !== 'list_item' && listStack.length > 0) {
        listStack.length = 0;
      }

      switch (block.tag) {
        case 'para':
          node = new Paragraph(block);
          parent.addChild(node);
          break;
        case 'table':
          node = new Table(block, prevNode);
          parent.addChild(node);
          break;
        case 'list_item':
          node = new ListItem(block);
          if (prevNode.tag === 'para' && prevNode.level === node.level) {
            listStack.push(prevNode);
          } else if (prevNode.tag === 'list_item') {
            if (node.level > prevNode.level) {
              listStack.push(prevNode);
            } else if (node.level < prevNode.level) {
              while (
                listStack.length > 0 &&
                listStack[listStack.length - 1].level > node.level
              ) {
                listStack.pop();
              }
            }
          }
          if (listStack.length > 0) {
            listStack[listStack.length - 1].addChild(node);
          } else {
            parent.addChild(node);
          }
          break;
        case 'header':
          node = new Section(block);
          if (node.level > parent.level) {
            parentStack.push(node);
            parent.addChild(node);
          } else {
            while (
              parentStack.length > 1 &&
              parentStack[parentStack.length - 1].level >= node.level
            ) {
              parentStack.pop();
            }
            parentStack[parentStack.length - 1].addChild(node);
            parentStack.push(node);
          }
          parent = node;
          break;
        default:
          node = new RootNode(block);
          parent.addChild(node);
      }

      prevNode = node;
    }

    return root;
  }
}

class ParsedDocument {
  reader: LayoutReader;
  rootNode: Block;
  json: any[];
  topSections: Block[];

  constructor(blocksJson: any[]) {
    this.reader = new LayoutReader();
    this.rootNode = this.reader.read(blocksJson);
    this.json = blocksJson;
    this.topSections = this._getTopSections();
  }

  chunks(): Block[] {
    return this.rootNode.chunks();
  }

  tables(): Block[] {
    return this.rootNode.tables();
  }

  sections(): Block[] {
    return this.rootNode.sections();
  }

  toText(includeDuplicates: boolean = false): string {
    let text = '';

    if (includeDuplicates) {
      for (const section of this.sections()) {
        text += section.toText(true, true) + '\n';
      }
    } else {
      for (const section of this.topSections) {
        text += section.toText(true, true) + '\n';
      }
    }

    return text;
  }

  /**
   * Returns html for the document by iterating through all the sections
   * @returns {string} - html string
   */
  toHtml(includeDuplicates: boolean = false): string {
    let htmlStr = '<html>';

    if (includeDuplicates) {
      for (const section of this.sections()) {
        htmlStr += section.toHtml(true, true);
      }
    } else {
      for (const section of this.topSections) {
        htmlStr += section.toHtml(true, true);
      }
    }

    htmlStr += '</html>';
    return htmlStr;
  }

  private _getTopSections(): Block[] {
    const topSections: Block[] = [];
    const sections = this.sections();
    const sectionsLen = sections.length;

    for (let i = 0; i < sectionsLen; i++) {
      let isTopSection = true;

      for (let j = 0; j < sectionsLen; j++) {
        if (i !== j) {
          if (sections[j].children.includes(sections[i])) {
            isTopSection = false;
            break;
          }
        }
      }

      if (isTopSection) {
        topSections.push(sections[i]);
      }
    }

    return topSections;
  }
}

export { ParsedDocument };
