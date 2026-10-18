@react.component
let make = (~name: string) => {
  <div className="rescript-hello">
    {React.string("Hello from ReScript, " ++ name)}
  </div>
}
