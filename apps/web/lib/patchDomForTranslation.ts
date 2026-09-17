/**
 * 브라우저 번역(크롬 구글 번역 등)은 텍스트 노드를 <font>로 바꿔 끼운다.
 * 이후 React가 원래 노드를 removeChild/insertBefore 하면 NotFoundError가 나고
 * 앱 전체가 global-error로 멈춘다. 대상 노드의 부모가 이미 다르면 원본 호출을 건너뛴다.
 * @see https://github.com/facebook/react/issues/11538#issuecomment-417504600
 */
if (typeof Node === "function" && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T) {
    if (child.parentNode !== this) return child
    return originalRemoveChild.call(this, child) as T
  }

  const originalInsertBefore = Node.prototype.insertBefore
  Node.prototype.insertBefore = function <T extends Node>(
    this: Node,
    newNode: T,
    referenceNode: Node | null
  ) {
    if (referenceNode && referenceNode.parentNode !== this) return newNode
    return originalInsertBefore.call(this, newNode, referenceNode) as T
  }
}

export {}
