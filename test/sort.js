const jsc = require("jsverify");

function mysort(array) {
    const newArray = array.slice();
    newArray.sort();

    return newArray;
} 

describe("mysort", () => {
    it("should always return an array of the same size", () => {
        const arbArrayNat = jsc.array(jsc.nat);

        jsc.checkForall(arbArrayNat, (array) => {
            const prevLength = array.length;

            const sorted = mysort(array);

            return sorted.length === prevLength;
        });
    });
});

const arbNat = {
    generator: (size) => {
        return jsc.random(0, size);
    },
    shrink: (value) => {
        const yieldOne = (value > 0)
            ? () => jsc.random(0, value - 1)
            : () => 1;

        const smaller = [];
        for (let i = 0; i < 5; i++) {
            smaller.push(yieldOne);
        }

        return smaller;
    },
    show: (value) => {
        return value + "";
    },
};

describe("arbNat", () => {
    it("should always return an natural number", () => {
        jsc.checkForall(arbNat, (nat) => {
            return nat > -1
                && nat === Math.ceil(nat);
        });
    });
});

function showCookie(cookie) {
    return "Cookie(" + cookie.name + ", " +
        cookie.freshness + ", " +
        cookie.chipType + " [" + cookie.numberOfChips + "], " +
        cookie.flavor + ")";
}

function shrinkCookie(cookie) {
    const size = cookie.numberOfChips;
    const smallerSize = (size > 0)
        ? size - 1
        : 0;

    const smaller = [];
    for (let i = 0; i < 5; i++) {
        smaller.push(generateCookie(smallerSize));
    }

    return smaller;
}

function generateCookie(size) {
    const cookie = {};

    // Name should be non-empty, only ascii
    cookie.name = jsc.asciinestring.generator(15);

    // Random freshness from list of possible values
    const freshnesses = ["fresh", "medium", "old", "stale"];
    cookie.freshness = freshnesses[
        jsc.random(0, freshnesses.length - 1)];

    // Random chocolate chip type, but if size is 0 then it must be
    // "none"
    if (size === 0) {
        cookie.chipType = "none";
    } else {
        chipTypes = ["milk chocolate", "dark chocolate", "none"];
        cookie.chipType = chipTypes[
            jsc.random(0, chipTypes.length - 1)];
    }

    // Random flavor from list of possible values, but if chipType is
    // "none" or size < 3 then it cannot be "plain"
    let flavors;
    if (cookie.chipType === "none" || size < 3) {
        flavors = ["peanut butter", "double chocolate"];
    } else {
        flavors = ["peanut butter", "double chocolate", "plain"];
    }
    cookie.flavor = flavors[jsc.random(0, flavors.length - 1)];

    // Random number of chips, but chipType "none" must have 0,
    // "plain" must have at least 3, and "peanut butter" cannot have
    // more than 5, all cannot have more than size, any chipType
    // except for "none" must have at least 1
    if (cookie.chipType === "none") {
        cookie.numberOfChips = 0;
    } else if (cookie.flavor === "plain") {
        cookie.numberOfChips = jsc.random(3, size);
    } else if (cookie.flavor === "peanut butter") {
        cookie.numberOfChips = jsc.random(1, Math.min(size, 5));
    } else {
        cookie.numberOfChips = jsc.random(1, size);
    }

    return cookie;
}

const arbCookie = jsc.bless({
    generator: generateCookie,
    shrink: shrinkCookie,
    show: showCookie,
});

const arbPlainCookie = jsc.suchthat(arbCookie, (cookie) => {
    return cookie.flavor === "plain";
});

const arbNoChipCookie = jsc.suchthat(arbCookie, (cookie) => {
    return cookie.chipType === "none";
});

const arbPeanutButterCookie = jsc.suchthat(arbCookie, (cookie) => {
    return cookie.flavor === "peanut butter";
});

describe("arbCookie", () => {
    it("should never generate a plain cookie with less than 3 chips",
        () => {
        jsc.checkForall(arbPlainCookie, (plainCookie) => {
            return plainCookie.numberOfChips > 3;
        });
    });

    it("should never generate a \"none\" chip cookie with > 0 chips",
        () => {
        jsc.checkForall(arbNoChipCookie, (noChipCookie) => {
            return noChipCookie.numberOfChips === 0;
        });
    });

    it("should never generate a peanut butter cookie with > 5 chips",
        () => {
        jsc.checkForall(arbPeanutButterCookie, (pbCookie) => {
            return pbCookie.numberOfChips <= 5;
        });
    });
});
