const pickInitialState = {
  org: "",
  domain: "",
  schema: "",
  instance: ""
};

const pickReducer = (state = pickInitialState, action) => {
  const { org, domain, schema, ver, instance, type } = action;
  switch (type) {
    case "ALL_PICK":
      return Object.assign({}, state, { org, domain, schema, ver, instance });
    default:
      return state;
  }
};

export default pickReducer;
