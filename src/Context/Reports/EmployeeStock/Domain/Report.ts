import { EmployeeStockENTITY } from 'logiflowerp-sdk';
type PlainObject = { [key: string]: any };

export class ReportEmployeeStock {
    processMongoDocuments(docs: EmployeeStockENTITY[], stocks: { keySearch: string; keyDetail: string; identity: string; available: number; }[]): PlainObject[] {
        return docs.map((doc) => this.flattenAndExpandAllArrays(doc, stocks));
    }

    private flattenAndExpandAllArrays(doc: EmployeeStockENTITY, stocks: { keySearch: string; keyDetail: string; identity: string; available: number; }[]): PlainObject {
        const results: PlainObject = {}
        const available = stocks.find(s => s.keySearch === doc.keySearch && s.keyDetail === doc.keyDetail && s.identity === doc.employee.identity)
        if (!available) {
            throw new Error(`No available stock found for keySearch: ${doc.keySearch}, keyDetail: ${doc.keyDetail}, identity: ${doc.employee.identity}`);
        }
        results['stock'] = available.available
        function recurse(obj: any, prefix = '') {
            for (const key in obj) {
                const newKey = prefix ? `${prefix}_${key}` : key
                const value = obj[key]
                if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
                    results[newKey] = value
                } else if (value !== null && typeof value === 'object') {
                    recurse(value, newKey)
                }
            }
        }
        recurse(doc);
        results['available'] = available.available
        return results;
    }
}