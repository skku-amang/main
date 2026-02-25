import{v as d,t as e}from"./iframe-ClrkLwBW.js";import{B as f}from"./button-BCFa3ign.js";import{c as n}from"./utils-d2XQ1MEC.js";import"./preload-helper-PPVm8Dsz.js";import"./index-GykmPlJA.js";import"./index-Drd88ecX.js";const t=d.forwardRef(({className:r,...a},s)=>e.jsx("div",{ref:s,className:n("rounded-lg border bg-card text-card-foreground shadow-sm",r),...a}));t.displayName="Card";const o=d.forwardRef(({className:r,...a},s)=>e.jsx("div",{ref:s,className:n("flex flex-col space-y-1.5 p-6",r),...a}));o.displayName="CardHeader";const i=d.forwardRef(({className:r,...a},s)=>e.jsx("h3",{ref:s,className:n("text-2xl font-semibold leading-none tracking-tight",r),...a}));i.displayName="CardTitle";const c=d.forwardRef(({className:r,...a},s)=>e.jsx("p",{ref:s,className:n("text-sm text-muted-foreground",r),...a}));c.displayName="CardDescription";const C=d.forwardRef(({className:r,...a},s)=>e.jsx("div",{ref:s,className:n("p-6 pt-0",r),...a}));C.displayName="CardContent";const x=d.forwardRef(({className:r,...a},s)=>e.jsx("div",{ref:s,className:n("flex items-center p-6 pt-0",r),...a}));x.displayName="CardFooter";t.__docgenInfo={description:"",methods:[],displayName:"Card"};C.__docgenInfo={description:"",methods:[],displayName:"CardContent"};c.__docgenInfo={description:"",methods:[],displayName:"CardDescription"};x.__docgenInfo={description:"",methods:[],displayName:"CardFooter"};o.__docgenInfo={description:"",methods:[],displayName:"CardHeader"};i.__docgenInfo={description:"",methods:[],displayName:"CardTitle"};const D={title:"ui/Card",component:t,tags:["autodocs"],decorators:[r=>e.jsx("div",{className:"w-[350px]",children:e.jsx(r,{})})]},m={render:()=>e.jsxs(t,{children:[e.jsxs(o,{children:[e.jsx(i,{children:"Card Title"}),e.jsx(c,{children:"Card Description"})]}),e.jsx(C,{children:e.jsx("p",{children:"Card Content"})}),e.jsx(x,{children:e.jsx(f,{children:"Action"})})]})},l={render:()=>e.jsx(t,{children:e.jsxs(o,{children:[e.jsx(i,{children:"Notifications"}),e.jsx(c,{children:"You have 3 unread messages."})]})})},p={render:()=>e.jsxs(t,{children:[e.jsxs(o,{children:[e.jsx(i,{children:"Team Information"}),e.jsx(c,{children:"Details about your team."})]}),e.jsx(C,{children:e.jsxs("div",{className:"space-y-2",children:[e.jsx("p",{className:"text-sm",children:"Members: 5"}),e.jsx("p",{className:"text-sm",children:"Sessions: Guitar, Bass, Drum"})]})})]})};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
}`,...m.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
    </Card>
}`,...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Card>
      <CardHeader>
        <CardTitle>Team Information</CardTitle>
        <CardDescription>Details about your team.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">Members: 5</p>
          <p className="text-sm">Sessions: Guitar, Bass, Drum</p>
        </div>
      </CardContent>
    </Card>
}`,...p.parameters?.docs?.source}}};const _=["Default","HeaderOnly","WithContent"];export{m as Default,l as HeaderOnly,p as WithContent,_ as __namedExportsOrder,D as default};
