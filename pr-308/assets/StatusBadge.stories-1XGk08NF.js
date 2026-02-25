import{t as e}from"./iframe-ClrkLwBW.js";import{B as i}from"./badge-OdUTuDy9.js";import{c as o}from"./utils-d2XQ1MEC.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Drd88ecX.js";const r=({status:n,className:c})=>e.jsxs(i,{variant:"outline",className:o(n==="Inactive"?"bg-red-100 text-destructive":"bg-green-100 text-green-600","text-md rounded-full border-none px-4 py-0.5 lg:py-1 font-semibold",c),children:[e.jsx("span",{className:"me-2 text-[0.5rem]",children:"●"}),n]});r.__docgenInfo={description:"",methods:[],displayName:"StatusBadge",props:{status:{required:!0,tsType:{name:"union",raw:'"Inactive" | "Active"',elements:[{name:"literal",value:'"Inactive"'},{name:"literal",value:'"Active"'}]},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};const v={title:"TeamBadges/StatusBadge",component:r,tags:["autodocs"],argTypes:{status:{control:"radio",options:["Active","Inactive"]}}},t={args:{status:"Active"}},s={args:{status:"Inactive"}},a={render:()=>e.jsxs("div",{className:"flex gap-4",children:[e.jsx(r,{status:"Active"}),e.jsx(r,{status:"Inactive"})]})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    status: "Active"
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    status: "Inactive"
  }
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex gap-4">
      <StatusBadge status="Active" />
      <StatusBadge status="Inactive" />
    </div>
}`,...a.parameters?.docs?.source}}};const g=["Active","Inactive","SideBySide"];export{t as Active,s as Inactive,a as SideBySide,g as __namedExportsOrder,v as default};
