// rideio.js

const WTS = {
    "pi": 5,
    "dr": 15
};

const GRP_SEP = " ";
const SUB_GRP_SEP = "-";

function processTextStub(inputText) {
    // Example logic: Convert text to uppercase
    return inputText.toUpperCase();
}

function processSubGrp(subGrp) {
    const ents = subGrp.split(SUB_GRP_SEP);
    const firstEnt = ents[0];
    const edges = [];

    // add subGrp edges
    for (let i = 0; i < ents.length; i++) {
        const ent = ents[i];
        if (ent !== firstEnt) {
            edges.push([firstEnt, ent, WTS["pi"]]);
        }
    }
    return [firstEnt, ents, edges];
}

function processGrp(grp) {
    let firstEnt = null;
    const ents = new Set();
    const edges = [];
    const entSubGrps = grp.split(GRP_SEP);

    for (let i = 0; i < entSubGrps.length; i++) {
        const [fe, es, eds] = processSubGrp(entSubGrps[i]);
        if (firstEnt === null) {
            firstEnt = fe;
        }
        es.forEach(ent => ents.add(ent));
        eds.forEach(edge => edges.push(edge));
    }

    // add grp edges
    ents.forEach(ent => {
        if (ent !== firstEnt) {
            edges.push([firstEnt, ent, WTS["dr"]]);
        }
    });

    return [firstEnt, [...ents], edges];
}

function processText(grps) {
    grps = grps.trim().split("\n").filter(g => g.length > 0);
    const ed = {};

    grps.forEach(grp => {
        const [dr, ents, edges] = processGrp(grp);
        edges.forEach(([n1, n2, wt]) => {
            if (ed.hasOwnProperty(`${n1},${n2}`)) {
                ed[`${n1},${n2}`] += wt;
            } else if (ed.hasOwnProperty(`${n2},${n1}`)) {
                ed[`${n2},${n1}`] -= wt;
            } else {
                ed[`${n1},${n2}`] = wt;
            }
        });
    });

    // consolidate edges and inv_edges
    for (let key in ed) {
        if (ed.hasOwnProperty(key)) {
            const [n1, n2] = key.split(",");
            if (ed.hasOwnProperty(`${n2},${n1}`)) {
                ed[`${n1},${n2}`] -= ed[`${n2},${n1}`];
                ed[`${n2},${n1}`] = 0;
            }
        }
    }

    // TODO: remove 0 wt edges
    let txt = "";
    const edKeys = Object.keys(ed).sort((a, b) => ed[a] - ed[b]);
    edKeys.forEach(key => {
        const [n1, n2] = key.split(",");
        const wt = ed[key];
        if (wt !== 0) {
            console.log(`${n1} <-- ${n2} ${wt}\n`);
            txt += `${n1} <-- ${n2} ${wt}`;
        }
    });

    // get individual wts
    const fd = {};
    Object.entries(ed).forEach(([key, wt]) => {
        const [n1, n2] = key.split(",");
        if (!fd[n1]) fd[n1] = 0;
        if (!fd[n2]) fd[n2] = 0;
        fd[n1] += wt;
        fd[n2] -= wt;
    });

    const fdKeys = Object.keys(fd).sort((a, b) => fd[a] - fd[b]);
    console.log("#".repeat(50));
    txt += `#######\n`;
    fdKeys.forEach(n => {
        const wt = fd[n];
        const s = wt > 0 ? "gets" : "pays";
        console.log(`${n} ${s} ${Math.abs(wt)}`);
        txt += `${n} ${s} ${Math.abs(wt)}\n`;
    });
    
    document.getElementById("output").value = `ooffn`;
    
    return txt;
}