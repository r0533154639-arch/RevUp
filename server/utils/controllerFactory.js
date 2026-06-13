/**
 * Controller Factory - מייצר controllers סטנדרטיים וחוסך חזרות קוד
 * מטפל אוטומטית ב-try/catch, error handling, ותגובות סטנדרטיות
 */

/**
 * asyncHandler - עוטף פונקציה אסינכרונית ומטפל בשגיאות
 */
export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    console.error(`Error in ${fn.name || 'handler'}:`, err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * createController - מייצר אובייקט controller עם פעולות CRUD סטנדרטיות
 * @param {Object} methods - אובייקט DAL עם פונקציות גישה לנתונים
 * @param {string} entityName - שם הישות (להודעות שגיאה)
 * @param {Object} options - אפשרויות התאמה אישית
 * @returns {Object} - אובייקט controller עם פעולות getAll, getById, create, update, remove
 */
export const createController = (methods, entityName, options = {}) => ({
  // GET all - מחזיר רשימה
  getAll: options.customGetAll || asyncHandler(async (req, res) => {
    const items = await methods.getByUserId(req.user.id, req.user.role, req.query);
    res.json(items);
  }),

  // GET by ID - מחזיר ישות בודדת
  getById: asyncHandler(async (req, res) => {
    const item = await methods.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: `${entityName} not found` });
    }
    res.json(item);
  }),

  // POST - יוצר ישות חדשה
  create: options.customCreate || asyncHandler(async (req, res) => {
    const id = await methods.create({ user_id: req.user.id, ...req.body });
    res.status(201).json({ id, message: `${entityName} created successfully` });
  }),

  // PUT/PATCH - מעדכן ישות קיימת
  update: asyncHandler(async (req, res) => {
    const item = await methods.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: `${entityName} not found` });
    }
    // בדיקת הרשאה - רק הבעלים יכול לעדכן
    if (item.user_id && item.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await methods.update(req.params.id, req.body);
    res.json({ message: `${entityName} updated successfully` });
  }),

  // DELETE - מוחק ישות
  remove: asyncHandler(async (req, res) => {
    const item = await methods.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: `${entityName} not found` });
    }
    // בדיקת הרשאה - רק הבעלים יכול למחוק
    if (item.user_id && item.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await methods.remove(req.params.id);
    res.json({ message: `${entityName} deleted successfully` });
  })
});

/**
 * createSimpleAction - יוצר פעולה פשוטה ללא CRUD מלא
 * @param {Function} dalFn - פונקציית DAL להפעלה
 * @param {Object} options - אפשרויות (beforeFn, afterFn)
 */
export const createSimpleAction = (dalFn, options = {}) => {
  return asyncHandler(async (req, res) => {
    // beforeFn - פונקציה שמופעלת לפני הפעולה
    if (options.beforeFn) {
      await options.beforeFn(req);
    }

    const result = await dalFn(req.params.id || req.user.id, req.body);

    // afterFn - פונקציה שמופעלת אחרי הפעולה (למשל שליחת מייל)
    if (options.afterFn) {
      await options.afterFn(result, req);
    }

    res.json({ success: true, ...result });
  });
};

/**
 * createActionWithData - יוצר פעולה שמחזירה נתונים
 * @param {Function} dalFn - פונקציית DAL שמחזירה נתונים
 */
export const createActionWithData = (dalFn) => {
  return asyncHandler(async (req, res) => {
    const data = await dalFn(req.user.id, req.user.role, req.params, req.query);
    res.json(data);
  });
};
