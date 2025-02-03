class PDFTextCache {
    private pdfText: string | null = null;
    private currentItemID: string | null = null;

    async getPDFText(item: Zotero.Item): Promise<string> {
        const itemID = item.id;
        
        if (this.currentItemID !== itemID.toString() || this.pdfText === null) {
            this.pdfText = await this.extractPDFText(item);
            this.currentItemID = itemID.toString();
            // ztoolkit.log("PDF Text extracted:", this.pdfText);
        }
        
        return this.pdfText;
    }
    // source: https://www.zotero.org/support/dev/client_coding/javascript_api
    private async extractPDFText(item: Zotero.Item): Promise<string> {
        if (!item.isAttachment()) {
            const attachments = item.getAttachments();
            for (const attachmentID of attachments) {
                const attachment = Zotero.Items.get(attachmentID);
                // ztoolkit.log("attachment:", attachment);
                if (attachment.attachmentContentType === "application/pdf" || attachment.attachmentContentType === "") {
                    return await attachment.attachmentText;
                }
            }
            throw new Error("No PDF attachment found for this item");
        }
        
        return "";  // attachment가 없는 경우 빈 문자열 반환
    }

    clearCache() {
        this.pdfText = null;
        this.currentItemID = null;
    }
}

export const pdfTextCache = new PDFTextCache();