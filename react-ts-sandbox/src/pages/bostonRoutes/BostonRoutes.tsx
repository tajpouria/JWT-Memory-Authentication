import * as React from "react";

import { useFetchSuspense } from "../../hooks/useFetchSuspense";

export const BostonRoutes: React.FC = React.memo(() => {
  return (
    <ul className="bostonRoutes">
      {useFetchSuspense("https://api-v3.mbta.com/routes").data.map(
        (route: any) => (
          <li key={route.attributes.sort_order} className="bostonRoutes__items">
            {route.attributes.long_name}
          </li>
        )
      )}
    </ul>
  );
});
