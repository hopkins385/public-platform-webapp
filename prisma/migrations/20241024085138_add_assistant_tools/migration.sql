-- CreateTable
CREATE TABLE "tools" (
    "id" TEXT NOT NULL,
    "function_id" SMALLINT NOT NULL,
    "function_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assistant_tools" (
    "id" TEXT NOT NULL,
    "assistant_id" TEXT NOT NULL,
    "tool_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "assistant_tools_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tools_function_id_key" ON "tools"("function_id");

-- CreateIndex
CREATE INDEX "assistant_tools_assistant_id_tool_id_index" ON "assistant_tools"("assistant_id", "tool_id");

-- AddForeignKey
ALTER TABLE "assistant_tools" ADD CONSTRAINT "assistant_tools_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "assistants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assistant_tools" ADD CONSTRAINT "assistant_tools_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
