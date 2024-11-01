import PageHeaderFirstLetters from "@/components/PageHeader/PageHeaderFirstLetters"
import PageHeaderLetters from "@/components/PageHeader/PageHeaderLetters"

const PageHeader = ({
  inputSentence,
  textSize
}: {
  inputSentence: string
  textSize: string // text-9xl과 같은 형식으로 입력
}) => {
  let sentence: string[] = inputSentence.split(" ")

  let firstLetters: { id: number; letter: string }[] = sentence.map(
    (word, index) => ({
      id: index + 1,
      letter: word.charAt(0)
    })
  )

  let modifiedSentence: { id: number; modifiedWord: string }[] = sentence.map(
    (word, index) => ({
      id: index + 1,
      modifiedWord: word.slice(1)
    })
  )

  return (
    <div className="flex">
      {firstLetters.map((firstLetter, i) => (
        <div className="flex" key={firstLetter.id}>
          <PageHeaderFirstLetters word={firstLetter} textSize={textSize} />
          <PageHeaderLetters word={modifiedSentence[i]} textSize={textSize} />
          {/* 수정된 문장 */}
        </div>
      ))}
    </div>
  )
}

export default PageHeader
