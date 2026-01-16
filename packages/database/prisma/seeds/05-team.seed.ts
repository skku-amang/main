import { PrismaClient, SessionName } from "../../generated/prisma"
import { getRandomInt, getRandomItems, getRandomBoolean } from "./utils"

export const seedTeam = async (prisma: PrismaClient) => {
  console.log("Seeding team...")

  const users = await prisma.user.findMany({
    where: {
      isAdmin: false
    }
  })
  const performances = await prisma.performance.findMany()
  const sessions = await prisma.session.findMany()

  if (
    users.length === 0 ||
    performances.length === 0 ||
    sessions.length === 0
  ) {
    console.error("Need Performances, Users, and Sessions data to seed Teams.")
    return
  }

  const bandConfiguration = [
    { sessionName: SessionName.VOCAL, capacity: 1 },
    { sessionName: SessionName.GUITAR, capacity: 2 },
    { sessionName: SessionName.BASS, capacity: 1 },
    { sessionName: SessionName.DRUM, capacity: 1 },
    { sessionName: SessionName.SYNTH, capacity: 1 }
  ]

  for (const performance of performances) {
    const teamCount = getRandomInt(2, 4)

    for (let i = 0; i < teamCount; i++) {
      const potentialUsers = getRandomItems(users, 15)
      const leader = potentialUsers[0]!

      let memberCount = 0

      const teamNumber = i + 1
      const isSelfMade = getRandomBoolean(0.2)

      await prisma.team.create({
        data: {
          name: `${performance.name} ${teamNumber}팀`,
          description: `${performance.name} ${teamNumber}팀입니다.`,
          posterImage: "https://picsum.photos/200/300",
          songName: isSelfMade
            ? `자작곡 ${teamNumber}`
            : `커버곡 ${teamNumber}`,
          songArtist: isSelfMade
            ? `팀 ${teamNumber}`
            : `Original Artist ${teamNumber}`,
          isFreshmenFixed: getRandomBoolean(0.3),
          isSelfMade: isSelfMade,
          Performance: {
            connect: {
              id: performance.id
            }
          },
          leader: {
            connect: { id: leader.id }
          },

          teamSessions: {
            create: bandConfiguration.map((config) => {
              const session = sessions.find(
                (s) => s.name === config.sessionName
              )!
              const assignedMembers = []

              for (let k = 0; k < config.capacity; k++) {
                assignedMembers.push(potentialUsers[memberCount++])
              }

              return {
                capacity: config.capacity,
                session: {
                  connect: { id: session.id }
                },
                members: {
                  create: assignedMembers.map((user, index) => ({
                    user: { connect: { id: user!.id } },
                    index: index + 1
                  }))
                }
              }
            })
          }
        }
      })
    }
  }

  console.log("Seeding team completed.")
}
