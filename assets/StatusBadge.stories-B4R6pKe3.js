import{t as e}from"./iframe-BUAzDUhU.js";import{B as c}from"./badge-BdlWeA8x.js";import{c as l}from"./utils-d2XQ1MEC.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Drd88ecX.js";const d={Active:"Active",Inactive:"Closed"},n=({status:a,size:m="small",className:i})=>{const o=a==="Inactive"?"bg-red-100 text-destructive":"bg-green-100 text-green-600";return m==="middle"?e.jsxs(c,{variant:"outline",className:l(o,"h-7 whitespace-nowrap rounded-full border-none px-4 text-sm font-semibold leading-none tracking-[0.05em]",i),children:[e.jsx("span",{className:"me-2 text-[0.5rem]",children:"●"}),d[a]]}):m==="large"?e.jsxs(c,{variant:"outline",className:l(o,"whitespace-nowrap rounded-full border-none px-4 py-1 text-xs font-semibold leading-none tracking-[0.05em] md:h-[32px] md:w-[130px] md:justify-center md:text-lg",i),children:[e.jsx("span",{className:"me-2 text-xs",children:"●"}),d[a]]}):e.jsxs(c,{variant:"outline",className:l(o,"whitespace-nowrap rounded-full border-none px-4 py-0.5 text-[10px] font-semibold leading-none tracking-[0.05em] lg:py-1",i),children:[e.jsx("span",{className:"me-2 text-[0.5rem]",children:"●"}),d[a]]})};n.__docgenInfo={description:"",methods:[],displayName:"StatusBadge",props:{status:{required:!0,tsType:{name:"union",raw:'"Inactive" | "Active"',elements:[{name:"literal",value:'"Inactive"'},{name:"literal",value:'"Active"'}]},description:""},size:{required:!1,tsType:{name:"union",raw:'"small" | "middle" | "large"',elements:[{name:"literal",value:'"small"'},{name:"literal",value:'"middle"'},{name:"literal",value:'"large"'}]},description:"",defaultValue:{value:'"small"',computed:!1}},className:{required:!1,tsType:{name:"string"},description:""}}};const f={title:"TeamBadges/StatusBadge",component:n,tags:["autodocs"],argTypes:{status:{control:"radio",options:["Active","Inactive"]}}},t={args:{status:"Active"}},s={args:{status:"Inactive"}},r={render:()=>e.jsxs("div",{className:"flex gap-4",children:[e.jsx(n,{status:"Active"}),e.jsx(n,{status:"Inactive"})]})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    status: "Active"
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    status: "Inactive"
  }
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex gap-4">
      <StatusBadge status="Active" />
      <StatusBadge status="Inactive" />
    </div>
}`,...r.parameters?.docs?.source}}};const S=["Active","Inactive","SideBySide"];export{t as Active,s as Inactive,r as SideBySide,S as __namedExportsOrder,f as default};
