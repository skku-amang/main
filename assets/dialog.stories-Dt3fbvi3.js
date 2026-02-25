import{v as u,t as e}from"./iframe-DK23BpUd.js";import{B as s}from"./button-DBgxYfUZ.js";import{R as v,T as C,P as B,C as f,a as T,b as h,D as j,O as N}from"./index-DmybT_29.js";import{c as i}from"./utils-d2XQ1MEC.js";import{X as _}from"./x-DeD_mXRJ.js";import{C as b}from"./circle-alert-Df318A0D.js";import{c as w}from"./createLucideIcon-B44em7JP.js";import"./preload-helper-PPVm8Dsz.js";import"./index-ZfFLWo1p.js";import"./index-Drd88ecX.js";import"./index-CW0V0Y4V.js";import"./index-B-47Es49.js";import"./index-Bm2KfaH6.js";import"./index-14ntHnnu.js";const O=w("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]),x=v,k=C,F=B,D=u.forwardRef(({className:t,...a},o)=>e.jsx(N,{ref:o,className:i("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",t),...a}));D.displayName=N.displayName;const n=u.forwardRef(({className:t,children:a,...o},y)=>e.jsxs(F,{children:[e.jsx(D,{}),e.jsxs(f,{ref:y,className:i("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",t),...o,children:[a,e.jsxs(T,{className:"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",children:[e.jsx(_,{className:"h-4 w-4"}),e.jsx("span",{className:"sr-only",children:"Close"})]})]})]}));n.displayName=f.displayName;const r=({className:t,...a})=>e.jsx("div",{className:i("flex flex-col space-y-1.5 text-center sm:text-left",t),...a});r.displayName="DialogHeader";const l=({className:t,...a})=>e.jsx("div",{className:i("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",t),...a});l.displayName="DialogFooter";const d=u.forwardRef(({className:t,...a},o)=>e.jsx(h,{ref:o,className:i("text-lg font-semibold leading-none tracking-tight",t),...a}));d.displayName=h.displayName;const c=u.forwardRef(({className:t,...a},o)=>e.jsx(j,{ref:o,className:i("text-sm text-muted-foreground",t),...a}));c.displayName=j.displayName;n.__docgenInfo={description:"",methods:[]};c.__docgenInfo={description:"",methods:[]};l.__docgenInfo={description:"",methods:[],displayName:"DialogFooter"};r.__docgenInfo={description:"",methods:[],displayName:"DialogHeader"};D.__docgenInfo={description:"",methods:[]};d.__docgenInfo={description:"",methods:[]};const M={title:"ui/Dialog",tags:["autodocs"]},g={render:()=>e.jsxs(x,{children:[e.jsx(k,{asChild:!0,children:e.jsx(s,{children:"Open Dialog"})}),e.jsxs(n,{children:[e.jsxs(r,{children:[e.jsx(d,{children:"Dialog Title"}),e.jsx(c,{children:"This is a basic dialog description."})]}),e.jsxs(l,{children:[e.jsx(s,{variant:"outline",children:"취소"}),e.jsx(s,{children:"확인"})]})]})]})},m={render:()=>e.jsx(x,{defaultOpen:!0,children:e.jsxs(n,{children:[e.jsxs(r,{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(O,{className:"h-5 w-5 text-primary"}),e.jsx(d,{children:"정말로 지원하시겠습니까?"})]}),e.jsx(c,{children:"이미 신청한 팀이 있으면 팀장에게 알려야 할 수도 있습니다."})]}),e.jsxs(l,{children:[e.jsx(s,{variant:"outline",children:"취소"}),e.jsx(s,{children:"확인"})]})]})})},p={render:()=>e.jsx(x,{defaultOpen:!0,children:e.jsxs(n,{children:[e.jsxs(r,{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(b,{className:"h-5 w-5 text-destructive"}),e.jsx(d,{children:"세션 지원이 취소되었습니다"})]}),e.jsx(c,{children:"이 작업은 되돌릴 수 없습니다."})]}),e.jsxs(l,{children:[e.jsx(s,{variant:"outline",children:"취소"}),e.jsx(s,{variant:"destructive",children:"확인"})]})]})})};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a basic dialog description.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">취소</Button>
          <Button>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
}`,...g.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <DialogTitle>정말로 지원하시겠습니까?</DialogTitle>
          </div>
          <DialogDescription>
            이미 신청한 팀이 있으면 팀장에게 알려야 할 수도 있습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">취소</Button>
          <Button>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <DialogTitle>세션 지원이 취소되었습니다</DialogTitle>
          </div>
          <DialogDescription>이 작업은 되돌릴 수 없습니다.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">취소</Button>
          <Button variant="destructive">확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
}`,...p.parameters?.docs?.source}}};const Q=["Basic","Success","Alert"];export{p as Alert,g as Basic,m as Success,Q as __namedExportsOrder,M as default};
