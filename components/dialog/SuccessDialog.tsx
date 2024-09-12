import React, { Dispatch, SetStateAction } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Player } from "@lottiefiles/react-lottie-player";
import SuccessJson from "@/public/json/success.json";

const SuccessDialog = ({
  openSuccess,
  setOpenSuccess,
  message,
}: {
  openSuccess: boolean;
  setOpenSuccess: Dispatch<SetStateAction<boolean>>;
  message: string;
}) => {
  return (
    <Dialog open={openSuccess} onOpenChange={setOpenSuccess}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="mb-[5px]">{message}</DialogTitle>
          <Player
            keepLastFrame
            autoplay
            loop={false}
            src={SuccessJson}
            style={{ height: "200px", width: "200px" }}
          ></Player>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDialog;
