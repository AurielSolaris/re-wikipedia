// ReScript + React re-implementation of the loading indicator.
// Mounted into the Preact tree through src/components/ReactIsland.js.

@react.component
let make = (~message: string="") =>
  <div className="loading-planet">
    <img className="moon" src="images/loading-moon.svg" />
    <img className="earth" src="images/loading-earth.svg" />
    <img className="galaxy" src="images/loading-galaxy.svg" />
    <p className="message"> {React.string(message)} </p>
  </div>
