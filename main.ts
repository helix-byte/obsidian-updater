import { Plugin, TFile, Notice } from "obsidian"

export default class Updater extends Plugin {
  onload(): Promise<void> | void {
    this.app.workspace.on('editor-change', this.updateUpdatedId.bind(this)); 
  }

  private async updateUpdatedId () {
    // 1. 检查是否存在 活跃文件
    const file: TFile | null = this.app.workspace.getActiveFile();
    if (!file) { console.log('不存在: 活跃文件'); return; }
    // 2. 检查是否存在 Front-Matter
    const fileContent = await this.app.vault.read(file);
    const frontMatterMatch: RegExpMatchArray | null = fileContent.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!frontMatterMatch) { console.log('不存在: Front-Matter'); return; }
    // 3. 检查是否存在 updated-id 字段
    const frontMatter = frontMatterMatch[1];
    const content = fileContent.substring(frontMatterMatch[0].length);
    const updatedIdMatch: RegExpMatchArray | null = frontMatter.match(/^updated-id:\s*(.*)$/m);
    if (!updatedIdMatch) { console.log('不存在: updated-id 字段'); return; }

    const now = new Date();
    const date: string = now.toISOString().slice(2, 10).replace(/-/g, '');
    const time: string = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const newUpdatedId = `${date}${time}`;
    
    const newFrontMatter = frontMatter.replace(
      /^updated-id:\s*(.*)$/m,
      `updated-id: ${newUpdatedId}`
    );
    const newFileContent = `---\n${newFrontMatter}\n---${content}`;
    
    await this.app.vault.process(file, (content) => newFileContent);
    console.log(`将${file.name}中的目标属性值更改为${newUpdatedId}.`);
  }
}
