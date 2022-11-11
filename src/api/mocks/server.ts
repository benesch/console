import { setupServer } from "msw/node";

import environmentControllerHandlers from "./environmentControllerHandlers";
import materializeHandlers from "./materializeHandlers";
import regionControllerHandlers from "./regionControllerHandlers";

export default setupServer(
  ...environmentControllerHandlers.concat(
    regionControllerHandlers,
    materializeHandlers
  )
);
