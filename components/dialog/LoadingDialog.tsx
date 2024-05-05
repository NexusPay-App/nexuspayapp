import React, { Dispatch, SetStateAction } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Player } from "@lottiefiles/react-lottie-player";
import LoadingJson from "@/public/json/loading.json";

const LoadingDialog = ({
  openLoading,
  setOpenLoading,
  message,
}: {
  openLoading: boolean;
  setOpenLoading: Dispatch<SetStateAction<boolean>>;
  message: string;
}) => {
  return (
    <Dialog open={openLoading} onOpenChange={setOpenLoading}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="mb-[5px]">{message}</DialogTitle>
          <Player
            keepLastFrame
            autoplay
            loop={true}
            src={LoadingJson}
            style={{ height: "200px", width: "200px" }}
          ></Player>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingDialog;
