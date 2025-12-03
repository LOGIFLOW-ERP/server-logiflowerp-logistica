

export class UseCaseProduction {

    constructor(
        private winReports: WinReports
    ) { }

    async exec(params: any) {
        return await this.winReports.exec(params)
    }

}