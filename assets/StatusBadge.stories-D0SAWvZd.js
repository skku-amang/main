import{t as e}from"./iframe-BbuGfLaf.js";import{B as d}from"./badge-BKngo_yi.js";import{c as i}from"./utils-d2XQ1MEC.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Drd88ecX.js";const m={Active:"Active",Inactive:"Closed"},r=({status:n,className:c,dotClassName:o="text-[0.5rem]"})=>e.jsxs(d,{variant:"outline",className:i(n==="Inactive"?"bg-red-100 text-destructive":"bg-green-100 text-green-600","whitespace-nowrap rounded-full border-none px-4 py-0.5 text-[10px] font-semibold leading-none tracking-[0.05em] lg:py-1",c),children:[e.jsx("span",{className:i("me-2",o),children:"●"}),m[n]]});r.__docgenInfo={description:"",methods:[],displayName:"StatusBadge",props:{status:{required:!0,tsType:{name:"union",raw:'"Inactive" | "Active"',elements:[{name:"literal",value:'"Inactive"'},{name:"literal",value:'"Active"'}]},description:""},className:{required:!1,tsType:{name:"string"},description:""},dotClassName:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"text-[0.5rem]"',computed:!1}}}};const x={title:"TeamBadges/StatusBadge",component:r,tags:["autodocs"],argTypes:{status:{control:"radio",options:["Active","Inactive"]}}},t={args:{status:"Active"}},a={args:{status:"Inactive"}},s={render:()=>e.jsxs("div",{className:"flex gap-4",children:[e.jsx(r,{status:"Active"}),e.jsx(r,{status:"Inactive"})]})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    status: "Active"
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    status: "Inactive"
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex gap-4">
      <StatusBadge status="Active" />
      <StatusBadge status="Inactive" />
    </div>
}`,...s.parameters?.docs?.source}}};const S=["Active","Inactive","SideBySide"];export{t as Active,a as Inactive,s as SideBySide,S as __namedExportsOrder,x as default};
