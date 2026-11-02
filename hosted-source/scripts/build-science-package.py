"""Build a PRIVATE import package from connector snapshots; never writes public assets.
Usage: python scripts/build-science-package.py INPUT_DIRECTORY OUTPUT_DIRECTORY
Inputs are the separately saved JSON snapshots, workbook tables, plan text and Physics ZIP.
This script does not download sources, execute ZIP scripts, or import student results.
"""
import collections, csv, hashlib, json, pathlib, re, sys

root, out = map(pathlib.Path, sys.argv[1:3])
out.mkdir(parents=True, exist_ok=True)
def read(name):
    return json.loads((root / name).read_text())
def rows(name):
    return read(name)["values"]
def uid(subject, year, number, part="I", subpart=""):
    return f"{subject}:{year}:{part}:{number}:{subpart}"
def unit(v):
    m = re.fullmatch(r"U0?(\d+)", str(v or ""))
    return "U" + str(int(m[1])) if m else None
def write(name, obj):
    (out / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
def filehash(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()
date = "2026-10-14"
notes = read("verification-notes.json")
workbooks = {s: read(k+"-v2-full.json") for s,k in [("biology","bio"),("chemistry","chem"),("physics","phys")]}
units = {s:[{"code":unit(r[0]),"name":r[1],"periods":r[2]} for r in w["Unit Map"][1:]] for s,w in workbooks.items()}
earlier, claude, audit = rows("earlier-bio.json")[1:], rows("original.json")[1:], rows("audit.json")[1:]
earlier = [r for r in earlier if r and str(r[0]).isdigit()]
claude = [r for r in claude if r and str(r[0]).isdigit()]
audit = [r for r in audit if r and str(r[0]).isdigit()]
key = lambda r:(int(r[0]),int(r[1]))
emap, cmap, amap = ({key(r):r for r in data} for data in [earlier,claude,audit])
records, decisions, crosswalk = [], [], []
def record(s,y,q,u,focus,source,confidence,flag="",locator=None):
    return dict(stable_id=uid(s,y,q),subject=s,exam_year=y,sitting_year=2024 if s=="chemistry" and y==2023 else None,
        paper_part="I",question_number=q,subpart="",source_kind="national_reference_candidate",
        source_locator=locator,source_access="private_owner",official_paper_verified=False,
        principal_unit=u,secondary_units=[],NIE_competency=None,concept_focus_paraphrase=focus,
        question_form="MCQ",reasoning_operation=None,family_id=None,answer_status="WITHHELD",
        classification_status="PROVISIONAL",evidence_tier=confidence,reviewer="source-attributed; current merge audit",
        reviewed_at=date,source_version=source,rights_notes="Private import only; no paper text or answer key.",
        review_flag=flag,paper_identity_status="original question not re-authenticated in this execution")
for k,r in sorted(amap.items()):
    y,q=k
    original=emap[k]; cr=cmap[k]
    chosen=unit(r[2])
    flag=r[6] if len(r)>6 else ""
    comp=None
    reviewed=y==2019 and q in [18,19,32,33,34,35,37,38,40,42,43,47,48,49,50]
    if y==2019 and q in [32,33,40,50]:
        n=notes["biology2019"]["q"+str(q)]; chosen=n["decision"]; comp=n["competency"]; flag=n["reason"]
    if (y,q)==(2023,30):
        flag="Printed-option issue reported; official correction/marking not independently checked. No definitive key."
    rr=record("biology",y,q,chosen,r[3],"independent-merge-candidate-20261014",r[5],flag,original[10] if len(original)>10 else None)
    rr["source_labels"]={"earlier":unit(original[2]),"claude":unit(cr[2]),"audit_copy":unit(r[2])}
    rr["NIE_competency"]=comp
    if reviewed:
        rr.update(classification_status="INDEPENDENTLY CHECKED",evidence_tier="original scan + NIE scope; marking unchecked",
            paper_identity_status="national-labelled scan inspected; official-host provenance not established",
            original_page=3 if q<20 else 5 if q<=35 else 6 if q<=42 else 7)
        rr["review_flag"]=(flag+" | " if flag else "")+"Teacher review and official scheme still required; classification review does not establish an answer."
    records.append(rr)
    crosswalk.append({"key":rr["stable_id"],"subject":"biology","source_A_v2":unit(original[2]) if q<=2 and y==2019 else None,
      "source_A_scope":"two example question rows; other original labels from linked earlier 350-row atlas",
      "earlier":unit(original[2]),"source_B_C":unit(cr[2]),"B_C_same_source":True,
      "independent_audit_copy":unit(r[2]),"candidate":chosen,"answer":"WITHHELD"})
    if original[2]!=cr[2] or chosen!=unit(r[2]) or (y,q)==(2023,30) or (y,q)==(2019,50):
        decisions.append({"key":rr["stable_id"],"source_A":unit(original[2]),"source_B_C":unit(cr[2]),
          "audit_copy":unit(r[2]),"observed_conflict":flag or f"Editorial primary unit {original[2]} → {cr[2]}",
          "primary_evidence":f"2019 original scan page {rr.get('original_page')}; NIE syllabus scope" if reviewed else None,
          "decision":chosen,"reviewer":"ChatGPT independent source inspection" if reviewed else "pending qualified teacher",
          "date":date,"confidence":rr["classification_status"],"deployed":False,"answer_validation":"not performed"})
chem = [r for r in rows("claude-Chem-Atlas.json")[1:] if r and re.match(r"20\d\d",str(r[0]))]
for r in chem:
    y,q=int(r[0][:4]),int(r[1]); u=unit(r[2]); flag=r[5] if len(r)>5 else ""
    rr=record("chemistry",y,q,u,r[3],"claude-single-pass-20261014",r[4],flag)
    if not u:rr["classification_status"]="UNCLASSIFIED"
    if "Boundary" in r[4]:rr["classification_status"]="TEACHER CHECK"
    rr["source_labels"]={"claude":u}
    records.append(rr)
    crosswalk.append({"key":rr["stable_id"],"subject":"chemistry","source_A_v2":None,
      "source_A_scope":"original heatmap blank; later editorial table reproduces Claude candidate",
      "source_B_C":u,"B_C_same_source":True,"candidate":u,"answer":"WITHHELD"})
    if rr["classification_status"]!="PROVISIONAL" or flag:
        decisions.append({"key":rr["stable_id"],"source_A":None,"source_B_C":u,"observed_conflict":flag or r[4],
          "primary_evidence":None,"decision":"retain provisional assignment; original paper and independent teacher required",
          "reviewer":"pending qualified teacher","date":date,"confidence":rr["classification_status"],"deployed":False})
release=root/"physics-release/Physics_MCQ_Intelligence_Data_Release_v1"
def csvrows(path):
    return list(csv.DictReader(open(path,encoding="utf-8-sig",newline="")))
primary=csvrows(release/"data/validated_primary_units_2000_2025.csv")
families=csvrows(release/"data/validated_current_families_2019_2025.csv")
name_unit={r["name"].lower():r["code"] for r in units["physics"]}
phys_claude={key(r):r for r in rows("claude-Phys-Atlas.json")[1:] if r and str(r[0]).isdigit()}
for r in primary:
    y,q=int(r["exam_year"]),int(r["question_number"])
    u=name_unit[r["validated_primary_unit"].lower()]; disputed=(y,q) in [(2019,26),(2019,35)]
    rr=record("physics",y,q,u,r["concept"],"physics-release-v1", "Source-validated primary unit; current audit arithmetic only",
        "Primary unit/subtopic cross-unit mismatch. Both source labels preserved; no automatic recode." if disputed else "",r["source_url"])
    rr.update(classification_status="TEACHER CHECK" if disputed else "SOURCE VALIDATED",
       family_id=r["question_family_id"] or None,secondary_units=[name_unit[r["validated_secondary_unit"].lower()]] if r["validated_secondary_unit"].lower() in name_unit else [],
       subtopic=r["primary_subtopic_label"] or None,subtopic_code=r["primary_subtopic_id"] or None,
       family_status=r["family_validation_status"],subtopic_status=r["subtopic_validation_status"],
       original_evidence_reference=r["evidence_reference"])
    records.append(rr)
    cr=phys_claude.get((y,q))
    crosswalk.append({"key":rr["stable_id"],"subject":"physics","source_A_v2":"current-era aggregates; 4 family example rows",
      "source_B_C":cr[2] if cr else None,"B_C_same_source":True,"release_primary":u,"candidate":u,
      "unit_subtopic_disputed":disputed,"answer":"WITHHELD"})
    if disputed:
        decisions.append({"key":rr["stable_id"],"source_A":u,"source_B_C":cr[2] if cr else None,
          "observed_conflict":r["validated_primary_unit"]+" vs "+r["primary_subtopic_label"],
          "primary_evidence":r["evidence_reference"],"decision":"retain source primary; qualify subtopic cross-link pending teacher",
          "reviewer":"current audit identified contradiction in release CSV","date":date,"confidence":"TEACHER CHECK","deployed":False})
# Parse the complete six diagnostic tables; a reference is never a completed attempt.
text=(root/"group-plan.txt").read_text()
diagnostics=[]
matches=list(re.finditer(r"(Biology|Chemistry|Physics) — Set ([AB])",text))
for i,m in enumerate(matches):
    body=text[m.end():matches[i+1].start() if i+1<len(matches) else len(text)]
    parts=re.findall(r"(20\d\d(?: \(sat 2024\))?)\s+([1-5]?\d)\s+(U\d+ [^\r\n]+)\s+([^\r\n]+)",body)
    for pos,(y,q,ut,focus) in enumerate(parts,1):
        s=m[1].lower();year=int(y[:4]);number=int(q)
        diagnostics.append(dict(position_id=f"{s}:{m[2]}:{pos}",set=m[2],position=pos,
            stable_id=uid(s,year,number),subject=s,exam_year=year,sitting_year=2024 if "sat" in y else None,
            question_number=number,paper_part="I",principal_unit=unit(ut.split()[0]),concept_focus_paraphrase=focus,
            official_paper_verified=False,original_question_checked=False,answer_status="WITHHELD",
            original_paper_locator=None,confidence="PROVISIONAL",review_flag="Exact original paper and question alignment pending."))
assert len(diagnostics)==70,len(diagnostics)
lookup={r["stable_id"]:r for r in records}
for d in diagnostics:
    r=lookup.get(d["stable_id"]);d["atlas_match"]=bool(r)
    d["atlas_unit"]=r["principal_unit"] if r else None
    d["original_paper_locator"]=r["source_locator"] if r else None
    d["unit_agreement"]=r is not None and r["principal_unit"]==d["principal_unit"]
    if not d["unit_agreement"]:d["review_flag"]+=" Plan/atlas unit conflict."
    if r and r["review_flag"]:d["review_flag"]+=" Atlas review: "+r["review_flag"]
    if d["exam_year"]==2024:
        d["official_host_candidate"]=notes["official2024"][d["subject"]]
    if d["subject"]=="chemistry" and d["exam_year"]==2023:
        d["original_paper_locator"]="https://example.invalid/private-resource/f84d19a0a7689fbe"
    d["authentication_status"]="locator resolved, exact question not independently authenticated" if d["original_paper_locator"] else "BLOCKED: original paper locator not resolved"
assert len(lookup)==1910
assert collections.Counter(r["subject"] for r in records)=={"biology":350,"chemistry":150,"physics":1410}
# Derived counts are always recomputed from the chosen atlas, with no editable second heatmap.
def totals(data):
    return dict(collections.Counter(unit(r[2]) for r in data))
bio_versions={"earlier":totals(earlier),"claude":totals(claude),"audit_copy":totals(audit),
    "candidate":dict(collections.Counter(r["principal_unit"] for r in records if r["subject"]=="biology"))}
assert all(sum(v.values())==350 for v in bio_versions.values())
chem_confidence=dict(collections.Counter(r[4] for r in chem))
assert sum(chem_confidence.values())==150
assert chem_confidence.get("Unclassified")==3
assert len(families)==173
recurrent=sum(int(f["distinct_papers"])>1 for f in families)
if recurrent != 75:
    decisions.append({"key":"physics:current-family-summary","observed_conflict":f"Report 75 recurrent /98 singleton; CSV membership recomputes {recurrent}/{len(families)-recurrent}",
      "primary_evidence":"350 current membership rows and 173 family records, counted independently",
      "decision":"preserve report claim and observed values; do not harmonize unsupported numbers",
      "reviewer":"ChatGPT deterministic recomputation","date":date,"confidence":"INDEPENDENTLY CHECKED arithmetic; editorial family definition pending","deployed":False})
paper2=[r for r in rows("claude-Phys-Paper-II.json")[1:] if r and re.fullmatch(r"20\d\d",str(r[0]))]
paper2refs=[dict(stable_id=uid("physics",int(r[0]),q,"II","A"),subject="physics",exam_year=int(r[0]),
    paper_part="II",question_number=q,subpart="A",focus=focus,classification_status="PROVISIONAL",
    official_paper_verified=False,source_version="correct-paper2.pdf",marking_status="not rechecked in this execution")
    for r in paper2 for q,focus in enumerate(r[1:5],1)]
original_practice=[dict(id=f"{s}:original:{unit(r[0])}",subject=s,unit=unit(r[0]),question_form=r[1],
    prompt=r[2],answer_cue=r[3],marking_insight=r[4],status="Original teaching example; not official scheme")
    for s,w in workbooks.items() for r in w["Original Practice"][1:]]
source_register=[]
for p in sorted(root.glob("*")):
    if p.is_file() and p.suffix in [".txt",".json",".xlsx",".pdf",".zip"] and not p.name.startswith("production"):
        source_register.append(dict(source_id=p.stem,filename=p.name,sha256=filehash(p),size_bytes=p.stat().st_size,
          access="private",claim_scope="source snapshot; review limits retained",rights="no third-party distribution"))
manifest=dict(schema="powerhouse-science-package",schema_version=1,dataset_version="2026-10-14.audit-candidate.1",
    date=date,status="PRIVATE PROVISIONAL CANDIDATE",counts={"biology":350,"chemistry":150,"physics":1410,"diagnostics":70},
    biology_versions=bio_versions,chemistry_confidence=chem_confidence,physics={"papers":26,"questions":1410,
      "current":350,"families":173,"reported_recurrent":75,"reported_singleton":98,
      "recomputed_recurrent":recurrent,"recomputed_singleton":len(families)-recurrent,
      "family_count_conflict":recurrent!=75,"denominator_rule":"60 through 2010; 50 from 2011"},
    limitations=["Not official exam-board validation. No answer keys.", "Biology Q40 newly classified U9 after original scan + NIE 9.4.1; teacher/scheme pending.",
      "Chemistry is PROVISIONAL, SINGLE-PASS; unclassified bucket retained; unknown years are NOT AUDITED.",
      "Physics source validation is field-specific; 2019 Q26/Q35 cross-unit disputes retained.",
      "B and C in the three-way review are the SAME Claude spreadsheet, not independent corroboration.",
      "Private sources must be imported locally; public app contains only generic methodology.",
      "All 70 diagnostic positions are provisional until exact original-question review.",
      "Study-group marks are private local working records; Notion remains canonical. No automatic sync."])
package=dict(**manifest,units=units,records=records,diagnostics=diagnostics,merge_decisions=decisions,
    source_register=source_register,source_crosswalk=crosswalk,physics_families=families,
    paper2=paper2refs,original_practice=original_practice,verification_notes=notes,
    session_protocol=[{"start":a,"end":b,"name":n} for a,b,n in [(0,5,"Target"),(5,35,"Timed attempt"),
        (35,50,"Strict marking"),(50,60,"Diagnose"),(60,75,"Minimum repair"),(75,85,"Reattempt + fresh transfer"),(85,90,"Schedule retests")]],
    weekly_plan=[{"week":1,"task":"Set A baseline; record only actual marked evidence."},
      {"week":2,"task":"Two demonstrated weak units; first retests; Physics Paper II practical."},
      {"week":3,"task":"Unseen mixed-year transfer; Physics reasoning families; teacher checks."},
      {"week":4,"task":"Set B; compare cautiously with baseline; no automatic mastery."}])
if (root/"source-inventory.json").exists():
    package["source_documents"]=read("source-inventory.json")
package["exam_papers"]=[{"paper_id":f"{s}:{y}:I","subject":s,"exam_year":y,
    "sitting_year":2024 if s=="chemistry" and y==2023 else None,"paper_part":"I",
    "source_kind":"national-labelled source reference, original authentication incomplete",
    "candidate_question_count":sum(r["subject"]==s and r["exam_year"]==y for r in records),
    "source_locators":sorted({r["source_locator"] for r in records if r["subject"]==s and r["exam_year"]==y and r["source_locator"]}),
    "official_paper_verified":False} for s,y in sorted({(r["subject"],r["exam_year"]) for r in records})]
package["review_events"]=decisions
package["dataset_version_record"]={"version":manifest["dataset_version"],"transform":"scripts/build-science-package.py","reviewed_at":date,"student_release":False}
package["user_attempts"]=[]
package["repair_events"]=[]
write("powerhouse-science-private-20261014.json",package)
write("dataset-manifest.json",manifest)
write("MERGE_DECISIONS.json",decisions)
write("diagnostic-crosswalk-70.json",diagnostics)
write("source-register.json",source_register)
write("three-way-crosswalk.json",crosswalk)
def export_csv(name,data):
    cols=list(dict.fromkeys(k for r in data for k in r))
    with open(out/name,"w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,cols);w.writeheader()
        for r in data:w.writerow({k:json.dumps(v,ensure_ascii=False) if isinstance(v,(dict,list)) else v for k,v in r.items()})
export_csv("diagnostic-crosswalk-70.csv",diagnostics)
export_csv("MERGE_DECISIONS.csv",decisions)
write("package-hash.json",{"file":"powerhouse-science-private-20261014.json",
    "sha256":filehash(out/"powerhouse-science-private-20261014.json")})
print(json.dumps({"records":len(records),"diagnostics":len(diagnostics),"decisions":len(decisions),
    "bio_versions":bio_versions,"chemistry":chem_confidence,"diagnostic_unit_conflicts":
    [d["position_id"] for d in diagnostics if not d["unit_agreement"]]}))
