module.exports = {
  backend: {
    file: "api/backend.yml",
    output: "frontend/src/api/backend.tsx",
    transformer: "frontend/api-transformer.js",
  },
  environmentController: {
    file: "api/environment-controller.yml",
    output: "frontend/src/api/environment-controller.tsx",
  },
  regionController: {
    file: "api/region-controller.yml",
    output: "frontend/src/api/region-controller.tsx",
  },
};
