import OleoPageHeaderFirstLetters from "@/components/OleoPageHeader/OleoPageHeaderFirstLetters"
import OleoPageHeaderLetters from "@/components/OleoPageHeader/OleoPageHeaderLetters"

const OleoPageHeader = ({
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
        <div className="mr-2 flex" key={firstLetter.id}>
          <OleoPageHeaderFirstLetters word={firstLetter} textSize={textSize} />
          <OleoPageHeaderLetters
            word={modifiedSentence[i]}
            textSize={textSize}
          />
        </div>
      ))}
    </div>
  )
}

export default OleoPageHeader
