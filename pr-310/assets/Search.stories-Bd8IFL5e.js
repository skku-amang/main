import{R as i,t}from"./iframe-CwF7Bjug.js";import{c as w}from"./utils-d2XQ1MEC.js";import{c as g}from"./createLucideIcon-DdgXDVF1.js";import{X as y}from"./x-BOIUpORC.js";import"./preload-helper-PPVm8Dsz.js";const b=g("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]),l=i.forwardRef(({className:r,onChange:f,...d},a)=>{const[u,p]=i.useState(d.defaultValue??""),m=i.useRef(null),h=e=>{p(e.target.value),f?.(e)},x=()=>{p("");const e=m.current;e&&(Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value")?.set?.call(e,""),e.dispatchEvent(new Event("input",{bubbles:!0})),e.focus())};return t.jsxs("div",{className:w("flex h-10 w-full items-center gap-x-2.5 rounded-[20px] border border-gray-200 bg-white px-[13px] py-2 text-sm ring-offset-background drop-shadow-[0_1px_2px_rgb(64,63,84,0.1)] transition duration-300 focus-within:ring-0 focus-within:ring-offset-0 focus-within:drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] md:w-80",r),children:[t.jsx(b,{size:24,className:"text-gray-500",strokeWidth:1.25}),t.jsx("input",{...d,placeholder:"검색",type:"text",ref:e=>{m.current=e,typeof a=="function"?a(e):a&&(a.current=e)},value:u,onChange:h,className:"w-full placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",style:{caretColor:"#111827"}}),u&&t.jsx("button",{type:"button",onClick:x,className:"flex-shrink-0 text-gray-400 hover:text-gray-600","aria-label":"검색어 지우기",children:t.jsx(y,{size:16,strokeWidth:2})})]})});l.displayName="Search";l.__docgenInfo={description:"",methods:[],displayName:"Search"};const k={title:"Search",component:l,tags:["autodocs"]},s={},o={args:{className:"w-60"}},c={args:{className:"w-full"},decorators:[r=>t.jsx("div",{className:"w-[400px]",children:t.jsx(r,{})})]},n={parameters:{viewport:{defaultViewport:"mobile1"}},decorators:[r=>t.jsx("div",{className:"w-full px-4",children:t.jsx(r,{})})]};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    className: "w-60"
  }
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    className: "w-full"
  },
  decorators: [Story => <div className="w-[400px]">
        <Story />
      </div>]
}`,...c.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  parameters: {
    viewport: {
      defaultViewport: "mobile1"
    }
  },
  decorators: [Story => <div className="w-full px-4">
        <Story />
      </div>]
}`,...n.parameters?.docs?.source}}};const C=["Default","CustomWidth","FullWidth","MobileView"];export{o as CustomWidth,s as Default,c as FullWidth,n as MobileView,C as __namedExportsOrder,k as default};
