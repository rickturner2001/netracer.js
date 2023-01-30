import { Bars3Icon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { Message } from "../../constants/schemas";
import { trpc } from "../../utils/trpc";
import Link from "next/link";
import { NetworkScan } from "@prisma/client";

function RoomPage() {
  const { query } = useRouter();
  const roomId = query.roomId as string;

  const { data: roomAnalysis } = trpc.useQuery([
    "room.getRoomAnalysis",
    { roomId: roomId },
  ]);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const [packetError, setPacketError] = useState(false);
  const [labelError, setLabelError] = useState(false);

  const utils = trpc.useContext();
  const { mutateAsync: doAnalysis, isLoading } = trpc.useMutation(
    ["room.do-analysis"],
    {
      onSuccess: () => {
        utils.invalidateQueries(["room.getRoomAnalysis"]);
      },
    }
  );

  const labelRef = useRef<HTMLInputElement>(null);
  const packetRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col bg-gradient-to-br from-violet-900 to-gray-900 relative justify-center items-center w-full h-screen">
      <Link href={"/"}>
        <div className="fixed cursor-pointer top-5 left-5 rounded-lg p-3 border-gray-400  bg-violet-800 border shadow-md text-white font-bold">
          <Bars3Icon className="w-5 h-5" />
        </div>
      </Link>

      <div className="flex flex-col w-1/2 space-y-12">
        <h1 className="text-3xl text-center font-bold text-white ">{roomId}</h1>
        <div className="flex w-full space-x-2">
          <div className="relative z-0 w-full">
            <input
              type="text"
              id="floating_standard"
              className="block py-2.5 text-white px-0 w-full text-sm bg-transparent border-0 border-b-2 border-white appearance-none focus:outline-none focus:ring-0 focus:border-violet-500 peer"
              ref={labelRef}
            />
            <label
              htmlFor="floating_standard"
              className="absolute text-sm text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-violet-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Label
            </label>
          </div>
          <div className="relative z-0 w-1/4">
            <input
              type="text"
              ref={packetRef}
              id="floating_standard"
              className="block py-2.5 text-white px-0 w-full text-sm bg-transparent border-0 border-b-2 border-white appearance-none focus:outline-none focus:ring-0 focus:border-violet-500 peer"
              defaultValue={1000}
            />
            <label
              htmlFor="floating_standard"
              className="absolute text-sm text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-violet-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              requests
            </label>
          </div>
        </div>

        {isLoading ? (
          <button className="bg-violet-500 w-full py-3 rounded-md px-5 text-white font-bold text-sm">
            <svg
              aria-hidden="true"
              role="status"
              className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="#1C64F2"
              />
            </svg>
            loading
          </button>
        ) : (
          <button
            onClick={() => {
              if (labelRef?.current?.value) {
                if (
                  packetRef.current?.value &&
                  !isNaN(+packetRef?.current?.value)
                ) {
                  doAnalysis({
                    id: labelRef.current.value,
                    numberOfPackets: +packetRef?.current?.value,
                    roomId: roomId,
                  });
                  setPacketError(false);
                  setLabelError(false);
                } else {
                  setPacketError(true);
                }
              } else {
                setLabelError(true);
              }
            }}
            className="flex-1 text-white bg-violet-500 font-bold rounded-lg p-3 text-sm"
          >
            Send Packets
          </button>
        )}
        {(labelError || packetError) && (
          <div className="my-6 w-full ">
            {labelError ? (
              <div
                className="p-4 mb-4 text-sm rounded-lg border-red-400 border text-red-400"
                role="alert"
              >
                <span className="font-medium">Danger alert!</span>
                Make sure to pass a valid label (alphanumeric)
              </div>
            ) : (
              <div
                className="p-4 mb-4 text-sm rounded-lg border-red-400 border text-red-400"
                role="alert"
              >
                <span className="font-medium">Danger alert!</span>
                Requests must be numeric
              </div>
            )}
          </div>
        )}
      </div>
      <div className="w-1/2 mt-12">
        <AnalysisDisplay roomAnalysis={roomAnalysis} />
      </div>
    </div>
  );
}

const AnalysisDisplay = ({
  roomAnalysis,
}: {
  roomAnalysis: NetworkScan[] | undefined;
}) => {
  if (!roomAnalysis) {
    return (
      <div className="ring ring-violet-500 p-4 mt-12 w-full rounded-lg flex flex-col items-center justify-center">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-white uppercase bg-violet-600 ">
          <tr>
            <th scope="col" className="px-6 py-3">
              label
            </th>
            <th scope="col" className="px-6 py-3">
              requests
            </th>
            <th scope="col" className="px-6 py-3">
              average RTT (ms)
            </th>
            <th scope="col" className="px-6 py-3">
              bandwidth (Bps)
            </th>
          </tr>
        </thead>
        <tbody>
          {roomAnalysis.map((analysis) => {
            return (
              <tr className="bg-violet-800 text-white ">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-white whitespace-nowrap "
                >
                  {analysis.id}
                </th>
                <td className="px-6 py-4">{analysis.numberOfPackets}</td>
                <td className="px-6 py-4">{analysis.averageRoundTripTime}</td>
                <td className="px-6 py-4">{analysis.bandwidth}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RoomPage;
