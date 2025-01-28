WTS = {
    "pi": 5,
    "dr": 15
}
GRP_SEP = " "
SUB_GRP_SEP = "-"


def process_sub_grp(sub_grp: str) -> (str, set, list):
    ents = sub_grp.split(SUB_GRP_SEP)
    first_ent = ents[0]
    edges = []
    # add sub_grp edges
    for ent in ents:
        if ent == first_ent:
            continue
        edges.append((first_ent, ent, WTS["pi"]))
    return first_ent, ents, edges


def process_grp(grp: str) -> (str, set, list):
    first_ent = None
    ents = set()
    edges = []
    ent_sub_grps = grp.split(GRP_SET)
    for ent_sub_grp in ent_sub_grps:
        fe, es, eds = process_sub_grp(ent_sub_grp)
        if first_ent is None:
            first_ent = fe
        ents.update(es)
        edges.extend(eds)
    # add grp edges
    for ent in ents:
        if ent == first_ent:
            continue
        edges.append((first_ent, ent, WTS["dr"]))
    return first_ent, ents, edges


def process_grps(grps: str) -> None:
    grps = [g for g in grps.strip().splitlines() if len(g) > 0]
    ed = {}
    for grp in grps:
        dr, ents, edges = process_grp(grp)
        for n1, n2, wt in edges:
            if (n1, n2) in ed.keys():
                ed[(n1, n2)] += wt
            elif (n2, n1) in ed.keys():
                ed[(n2, n1)] -= wt
            else:
                ed[(n1, n2)] = wt
    # consolidate edges and inv_edges
    for (n1, n2) in wt in ed.items():
        if (n2, n1) in ed.keys():
            ed[(n1, n2)] -= ed[(n2, n1)]
            ed[(n2, n1)] = 0
    # TODO: remove 0 wt edges
    ed_keys = sorted(ed, key=ed.get)
    for (n1, n2) in ed_keys:
        wt = ed[(n1, n2)]
        if wt == 0:
            continue
        print(f"{n1} <-- {n2} {wt}")
    # get individual wts
    fd = {}
    for (n1, n2), wt in ed.items():
        if n1 not in fd:
            fd[n1] = 0
        if n2 not in fd:
            fd[n2] = 0
        fd[n1] += wt
        fd[n2] -= wt
    fd_keys = sorted(fd, key=fd.get)
    print("#" * 50)
    for n in fd_keys:
        wt = fd[n]
        if wt > 0:
            s = "gets"
        elif wt < 0:
            s = "pays"
        print(f"{n} {s} {abs(wt)}")
