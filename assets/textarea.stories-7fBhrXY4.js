import{v as l,t as o}from"./iframe-BUAzDUhU.js";import{L as n}from"./label-C5eNOw09.js";import{c as p}from"./utils-d2XQ1MEC.js";import"./preload-helper-PPVm8Dsz.js";import"./index-C48LhhLi.js";import"./index-4Vf37fNZ.js";import"./index-CbQYw92i.js";import"./index-Drd88ecX.js";const t=l.forwardRef(({className:d,...i},c)=>o.jsx("textarea",{className:p("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",d),ref:c,...i}));t.displayName="Textarea";t.__docgenInfo={description:"",methods:[],displayName:"Textarea"};const v={title:"ui/Textarea",component:t,tags:["autodocs"],argTypes:{disabled:{control:"boolean"}}},e={args:{placeholder:"Type your message here."}},r={args:{defaultValue:"동아리 활동에 대한 설명을 입력하세요."}},a={args:{placeholder:"Disabled textarea",disabled:!0}},s={render:()=>o.jsxs("div",{className:"space-y-2",children:[o.jsx(n,{htmlFor:"description",children:"장비 설명"}),o.jsx(t,{id:"description",placeholder:"예: 88 keys"})]})};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Type your message here."
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: "동아리 활동에 대한 설명을 입력하세요."
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Disabled textarea",
    disabled: true
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-2">
      <Label htmlFor="description">장비 설명</Label>
      <Textarea id="description" placeholder="예: 88 keys" />
    </div>
}`,...s.parameters?.docs?.source}}};const T=["Default","WithValue","Disabled","WithLabel"];export{e as Default,a as Disabled,s as WithLabel,r as WithValue,T as __namedExportsOrder,v as default};
