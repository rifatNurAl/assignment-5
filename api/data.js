import { Router } from "express";
import { getAllData, getDataById, addData, runProcedure } from "../db/db.js";
let router = Router();

router.get("/", async (req, res) => {
  res.json(await getAllData());
});


router.get("/procedure", async (req, res) => {
  try {
    const result = await runProcedure();
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Procedure error" });
  }
});

//get by id
router.get("/:id", async (req, res) => {
  try {
    const result = await getDataById(req.params.id);
    if (result.length === 0)
      return res.status(404).json({ error: "record not found" });

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "database error" });
  }
});

//post
router.post("/", async (req, res) => {
  try {
    const [exist] = await getDataById(req.body.id);
    if (exist) return res.status(409).json({ error: "record already exists" });

    const result = await addData(req.body);
    if (!result) return res.status(500).json({ error: "insert failed" });

    res.status(201).json(req.body);
  } catch (err) {
    res.status(500).json({ error: "database error" });
  }
});

// update
router.put("/:id", async (req, res) => {
  try {
    const [exist] = await getDataById(req.params.id);
    if (!exist) return res.status(404).json({ error: "record not found" });

    const result = await updateData(req.params.id, req.body);
    if (!result) return res.status(500).json({ error: "update failed" });

    res.json({ message: "record updated" });
  } catch (err) {
    res.status(500).json({ error: "database error" });
  }
});

//delete
router.delete("/:id", async (req, res) => {
  try {
    const [exist] = await getDataById(req.params.id);
    if (!exist) return res.status(404).json({ error: "record not found" });

    const result = await deleteData(req.params.id);
    if (!result) return res.status(500).json({ error: "delete failed" });

    res.json({ message: "record deleted" });
  } catch (err) {
    res.status(500).json({ error: "database error" });
  }
});

export default router;
