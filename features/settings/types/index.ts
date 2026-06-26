export interface AppSettings { storeName:string; 
    storeAddress:string; 
    storePhone:string; 
    storeGstin:string; 
    currency:string; 
    billPrefix:string; 
    billCounter:string; 
    taxIncluded:string; 
    printReceiptAuto:string; 
    theme:string; 
    printerName:string; 
    printerWidth:string; 
}
export interface AppSettings {
    storeName: string; storeAddress: string; storePhone: string; storeGstin: string;
    currency: string; billPrefix: string; billCounter: string; taxIncluded: string;
    printReceiptAuto: string; theme: string; printerName: string; printerWidth: string;
    excelExportFolderPath: string;
    lastDailySyncAt: string;
    lastMonthlySyncAt: string;
    googleSheetsEnabled: string;
    googleSheetsCredentialsPath: string;
    googleSheetsSpreadsheetId: string;
  }