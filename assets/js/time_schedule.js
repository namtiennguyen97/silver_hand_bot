const RealDate = Date;
Date = class extends RealDate {
    constructor(...args) {
        if (args.length === 0) {
            const tokyoNow = new RealDate().toLocaleString("en-US", {
                timeZone: "Asia/Tokyo",
            });
            super(tokyoNow);
        } else {
            super(...args);
        }
    }
};