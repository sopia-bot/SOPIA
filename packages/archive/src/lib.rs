#![deny(clippy::all)]
 
#[macro_use]
extern crate napi_derive;

use std::io::prelude::*;
use napi::bindgen_prelude::*;
use napi::{JsBuffer, JsBufferValue, Ref};
 
struct UncompressBuffer {
  data: Ref<JsBufferValue>,
  name: String
}
 
impl UncompressBuffer {
  pub fn new(data: Ref<JsBufferValue>, name: String) -> Self {
    Self { data, name }
  }
}
 
#[napi]
impl Task for UncompressBuffer {
  type Output = Buffer;
  type JsValue = Buffer;
 
  fn compute(&mut self) -> Result<Self::Output> {
    let reader = std::io::Cursor::new((&self.data).to_vec());
    let mut zip = zip::ZipArchive::new(reader).unwrap();
    let mut file = zip.by_name(&self.name).unwrap();
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer);
    Ok(Buffer::from(buffer))
  }
 
  fn resolve(&mut self, env: Env, output: Self::Output) -> Result<Self::JsValue> {
    Ok(output)
  }
 
  fn finally(&mut self, env: Env) -> Result<()> {
    self.data.unref(env)?;
    Ok(())
  }
}

#[napi]
fn uncompress(input: JsBuffer, name: String) -> AsyncTask<UncompressBuffer> {
  AsyncTask::new(UncompressBuffer {
    data: input.into_ref().unwrap(),
    name: name,
  })
}