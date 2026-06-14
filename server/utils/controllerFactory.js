
export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    console.error(`Error in ${fn.name || 'handler'}:`, err);
    res.status(500).json({ message: err.message });
  }
};


export const createController = (methods, entityName, options = {}) => ({

  getAll: options.customGetAll || asyncHandler(async (req, res) => {
    const items = await methods.getByUserId(req.user.id, req.user.role, req.query);
    res.json(items);
  }),


  getById: asyncHandler(async (req, res) => {
    const item = await methods.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: `${entityName} not found` });
    }
    res.json(item);
  }),


  create: options.customCreate || asyncHandler(async (req, res) => {
    const id = await methods.create({ user_id: req.user.id, ...req.body });
    res.status(201).json({ id, message: `${entityName} created successfully` });
  }),

  update: asyncHandler(async (req, res) => {
    const item = await methods.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: `${entityName} not found` });
    }
    if (item.user_id && item.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await methods.update(req.params.id, req.body);
    res.json({ message: `${entityName} updated successfully` });
  }),

  remove: asyncHandler(async (req, res) => {
    const item = await methods.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: `${entityName} not found` });
    }
  
    if (item.user_id && item.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await methods.remove(req.params.id);
    res.json({ message: `${entityName} deleted successfully` });
  })
});


export const createSimpleAction = (dalFn, options = {}) => {
  return asyncHandler(async (req, res) => {
    if (options.beforeFn) {
      await options.beforeFn(req);
    }

    const result = await dalFn(req.params.id || req.user.id, req.body);

    if (options.afterFn) {
      await options.afterFn(result, req);
    }

    res.json({ success: true, ...result });
  });
};

export const createActionWithData = (dalFn) => {
  return asyncHandler(async (req, res) => {
    const data = await dalFn(req.user.id, req.user.role, req.params, req.query);
    res.json(data);
  });
};
